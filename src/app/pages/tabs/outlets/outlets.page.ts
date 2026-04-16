import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AppService } from 'src/app/shared/services/app.service';
import { PageStateService } from 'src/app/shared/services/page-state.service';
import { PageParamKey } from 'src/app/shared/statics/interface-helper';
import { Outlet } from 'src/app/core/models/outlet.model';
import { OutletApiService } from 'src/app/core/repo/api/outlet-api-service';
import { Geolocation } from '@capacitor/geolocation';
import { DistanceCalculator } from 'src/app/shared/utils/distance-calculator';
import { Browser } from '@capacitor/browser';
import { AlertController } from '@ionic/angular';
import { AppLauncher } from '@capacitor/app-launcher';
@Component({
  selector: 'app-outlets',
  templateUrl: './outlets.page.html',
  styleUrls: ['./outlets.page.scss'],
  standalone: false,
})
export class OutletsPage implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapElement!: ElementRef<HTMLDivElement>;

  @Input() initialZoom = 14;
  @Input() focusZoom = 16;

  map!: google.maps.Map;
  placesService!: google.maps.places.PlacesService;

  selectedOutlet?: Outlet & { distanceKm?: number };
  outlets: (Outlet & { distanceKm?: number })[] = [];

  isOrderOutletSelectPage = false;

  Loaded = false;

  /** 内部状态 */
  private viewReady = false;
  private outletsReady = false;
  private markersById = new Map<number, google.maps.Marker>();

  constructor(
    private appService: AppService,
    private pageStateService: PageStateService,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private outletApiService: OutletApiService,
    private alertCtrl: AlertController,
  ) {}

  ngOnInit(): void {
    this.setupZoomLevels();

    this.isOrderOutletSelectPage =
      this.route.snapshot.queryParamMap.get(PageParamKey.Order_Outlet_Select) === '1';

    this.outletApiService.getAllOutlets().subscribe({
      next: (res: Outlet[]) => {
        this.outlets = (res ?? []).map((o) => ({ ...o }));
        this.selectedOutlet = this.outlets[0];
        this.outletsReady = true;
      },
      error: (err) => {
        console.error('Load outlet Fail:', err);
      },
      complete: () => {
        this.Loaded = true;
        setTimeout(() => this.maybeInitMap(), 500); // ✅ 第一次载入初始化
      },
    });
  }
  ionViewWillEnter() {
    // ✅ 每次页面重新进入时重新初始化地图
    if (this.outletsReady) {
      setTimeout(() => this.maybeInitMap(), 500);
    }
  }

  ngAfterViewInit() {
    this.viewReady = true;
    this.maybeInitMap();
  }

  /** DOM + 数据都就绪才初始化，避免双重 init */
  private maybeInitMap() {
    if (!this.viewReady || !this.outletsReady || !this.mapElement?.nativeElement) return;
    if (this.map) return;

    const defaultCenter = this.getDefaultCenter();

    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: defaultCenter,
      zoom: this.initialZoom,
      mapTypeControl: false,
      mapTypeId: 'roadmap',
      streetViewControl: false,
      disableDefaultUI: true,
      clickableIcons: false,
      styles: [
        { featureType: 'administrative', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
        { featureType: 'road', stylers: [{ visibility: 'on' }] },
      ],
    });

    this.placesService = new google.maps.places.PlacesService(this.map);
    this.loadMarkers();
    this.tryLocateAndFocusNearest();
  }

  /** 放置 markers 并索引到 id */
  private loadMarkers() {
    this.markersById.forEach((m) => m.setMap(null));
    this.markersById.clear();

    const bounds = new google.maps.LatLngBounds();

    this.outlets.forEach((o) => {
      const pos = { lat: o.latitude, lng: o.longitude };
      const marker = new google.maps.Marker({
        position: pos,
        map: this.map,
        title: o.name,
        // icon: { url: 'assets/icon/pin-gold.svg', scaledSize: new google.maps.Size(28,28) }
      });
      marker.addListener('click', () => this.focusOutlet(o));
      this.markersById.set(o.id, marker);
      bounds.extend(pos);
    });

    if (!bounds.isEmpty()) {
      this.map.fitBounds(bounds);
      const once = google.maps.event.addListenerOnce(this.map, 'bounds_changed', () => {
        if (this.map.getZoom()! > this.initialZoom) this.map.setZoom(this.initialZoom);
        google.maps.event.removeListener(once);
      });
    }
  }

  /** 首次进入尝试定位 → 计算距离 → 排序（最近在最上面）→ 聚焦最近 */
  private tryLocateAndFocusNearest() {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;

        // 用户蓝点
        new google.maps.Marker({
          position: { lat: userLat, lng: userLng },
          map: this.map,
          title: 'You are here',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#0062ffff',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        this.updateAllDistancesAndSort(userLat, userLng);
        const nearest = this.outlets[0];
        if (nearest) this.focusOutlet(nearest);
      },
      (err) => {
        console.warn('⚠️ Geolocation denied/unavailable:', err);
        // 无定位授权：可按名字排序，或保持 API 顺序
        this.outlets.sort((a, b) => a.name.localeCompare(b.name));
      },
    );
  }

  /** 计算每家门店 distanceKm 并排序 */
  private updateAllDistancesAndSort(userLat: number, userLng: number) {
    this.outlets.forEach((o) => {
      const meters = DistanceCalculator.getDistanceInMeters(
        userLat,
        userLng,
        o.latitude,
        o.longitude,
      );
      o.distanceKm = +(meters / 1000).toFixed(1);
    });
    this.outlets.sort((a, b) => {
      const da = a.distanceKm ?? Number.POSITIVE_INFINITY;
      const db = b.distanceKm ?? Number.POSITIVE_INFINITY;
      return da - db;
    });
  }

  /** 列表项 / marker 点击聚焦 */
  focusOutlet(outlet: Outlet & { distanceKm?: number }) {
    this.selectedOutlet = outlet;
    this.map.panTo({ lat: outlet.latitude, lng: outlet.longitude });
    this.map.setZoom(this.focusZoom);

    const m = this.markersById.get(outlet.id);
    if (m) {
      // 可选：给一个轻微动画提示
      // m.setAnimation(google.maps.Animation.BOUNCE);
      // setTimeout(() => m.setAnimation(null), 600);
    }
  }

  private setupZoomLevels() {
    const w = window.innerWidth;
    if (w < 768) {
      this.initialZoom = 14;
      this.focusZoom = 16;
    } else if (w < 1080) {
      this.initialZoom = 16;
      this.focusZoom = 18;
    } else {
      this.initialZoom = 17;
      this.focusZoom = 19;
    }
  }

  /** “当前位置/重置” */
  async resetZoomLevels() {
    try {
      const pos = await Geolocation.getCurrentPosition();
      const userLat = pos.coords.latitude;
      const userLng = pos.coords.longitude;

      this.updateAllDistancesAndSort(userLat, userLng);

      const nearest = this.outlets[0];
      if (nearest) {
        this.focusOutlet(nearest);
        return;
      }
    } catch (error) {
      console.error('❌ Failed to get location:', error);
    }
    // 兜底
    this.map.panTo(this.getDefaultCenter());
    this.map.setZoom(this.initialZoom);
    this.selectedOutlet = undefined;
  }

  private getDefaultCenter() {
    return this.outlets.length > 0
      ? { lat: this.outlets[0].latitude, lng: this.outlets[0].longitude }
      : { lat: 3.139, lng: 101.6869 }; // KL 兜底
  }

  async openMap(outlet: Outlet) {
    const alert = await this.alertCtrl.create({
      header: 'Open with',
      buttons: [
        {
          text: 'Google Maps',
          handler: () => {
            this.openInGoogleMaps(outlet);
          },
        },
        {
          text: 'Waze',
          handler: () => {
            this.openInWaze(outlet);
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });

    await alert.present();
  }

  // async openInWaze(outlet: Outlet) {
  //   const lat = outlet.latitude;
  //   const lng = outlet.longitude; // 1. 检查是否在手机 App 环境

  //   if (this.appService.isMobilePlatform()) {
  //     try {
  //       // 尝试检测是否安装了 Waze
  //       // 注意：Android 必须在 AndroidManifest.xml 配置 <queries>，否则这里永远返回 false
  //       const canOpen = await AppLauncher.canOpenUrl({ url: 'waze://' });

  //       if (canOpen.value) {
  //         // A. 已安装：直接唤醒 App
  //         await AppLauncher.openUrl({ url: `waze://?ll=${lat},${lng}&navigate=yes` });
  //       } else {
  //         // B. 未安装：打开网页版链接（会自动跳转应用商店）
  //         console.warn('Waze not installed or queries scheme missing');
  //         const webUrl = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
  //         await Browser.open({ url: webUrl });
  //       }
  //     } catch (e) {
  //       console.error('Error launching Waze:', e); // 兜底方案：发生任何错误都尝试用浏览器打开
  //       await Browser.open({ url: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes` });
  //     }
  //   } // 2. 电脑/网页版环境
  //   else {
  //     window.open(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_blank');
  //   }
  // }

  async openInWaze(outlet: Outlet) {
    const lat = outlet.latitude;
    const lng = outlet.longitude;
    const wazeUrl = `waze://?ll=${lat},${lng}&navigate=yes`;

    if (this.appService.isMobilePlatform()) {
      try {
        const canOpen = await AppLauncher.canOpenUrl({ url: 'waze://' });

        if (canOpen.value) {
          await AppLauncher.openUrl({ url: wazeUrl });
        } else {
          // 如果这里弹出来，说明 Manifest 没生效，或者 Android 11+ 权限锁死了
          console.warn('Waze check returned false');

          // 🔥 暴力尝试：即使检测说没有，我们还是强行试着打开一次
          // 因为有时候检测会因为系统原因误报 false
          try {
            await AppLauncher.openUrl({ url: wazeUrl });
          } catch (forceError) {
            // 真的打不开，才去浏览器
            const webUrl = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
            await Browser.open({ url: webUrl });
          }
        }
      } catch (e) {
        console.error('Error', e);
        // 出错兜底
        const webUrl = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
        await Browser.open({ url: webUrl });
      }
    } else {
      window.open(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_blank');
    }
  }

  async openBrowser(url: string) {
    if (this.appService.isMobilePlatform()) {
      await Browser.open({ url });
    } else {
      window.open(url, '_blank');
    }
  }

  async openInGoogleMaps(outlet: Outlet) {
    const request: google.maps.places.FindPlaceFromQueryRequest = {
      query: outlet.name,
      fields: ['place_id', 'name', 'geometry'], // 确保获取 name 和 geometry 用于原生跳转
    }; // 使用 Google Places Service 查找 Place ID

    this.placesService.findPlaceFromQuery(request, async (results, status) => {
      if (results && status === google.maps.places.PlacesServiceStatus.OK && results[0]) {
        const place = results[0];
        const placeId = place.place_id;
        const name = outlet.name; // 或者用 place.name
        const lat = outlet.latitude;
        const lng = outlet.longitude;

        // ✅ 这是你想要的 Place ID 网页链接格式
        // (修正了一下格式，使用 Google 官方推荐的 Place ID 搜索链接，兼容性更好)
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${placeId}`;

        if (this.appService.isMobilePlatform()) {
          const isAndroid = /android/i.test(navigator.userAgent);

          try {
            // Android 使用 geo: 协议，iOS 使用 comgooglemaps:
            const scheme = isAndroid ? 'geo:' : 'comgooglemaps://';

            const canOpen = await AppLauncher.canOpenUrl({ url: scheme });

            if (canOpen.value) {
              let nativeUrl = '';
              if (isAndroid) {
                // Android 标准写法: geo:lat,lng?q=名字 (q参数会自动在地图上插点)
                nativeUrl = `geo:${lat},${lng}?q=${encodeURIComponent(name)}`;
              } else {
                // iOS 写法
                nativeUrl = `comgooglemaps://?q=${encodeURIComponent(name)}&center=${lat},${lng}`;
              }
              await AppLauncher.openUrl({ url: nativeUrl });
            } else {
              await Browser.open({ url: webUrl });
            }
          } catch (e) {
            await Browser.open({ url: webUrl });
          }
        } else {
          // 4. 电脑端直接打开
          window.open(webUrl, '_blank');
        }
      } else {
        console.error('Place not found or API Error');
        // 如果查不到 Place ID，直接用经纬度兜底
        const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${outlet.latitude},${outlet.longitude}`;
        await Browser.open({ url: fallbackUrl });
      }
    });
  }

  selectOutlet(outlet: Outlet) {
    if (this.isOrderOutletSelectPage) {
      this.pageStateService.triggerOrderOutletSelectPage(outlet);
      this.navCtrl.back();
    }
  }
  async OpenWhatsapp(phoneNumber: string) {
    const url = `https://wa.me/6${phoneNumber}`;

    if (this.appService.isMobilePlatform()) {
      await Browser.open({ url });
    } else {
      window.open(url, '_blank');
    }
  }
}
