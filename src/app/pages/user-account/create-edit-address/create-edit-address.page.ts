import { AfterViewInit, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { debounceTime, distinctUntilChanged, of, Subscription, switchMap, take } from 'rxjs';
import { LoadingHelperService } from 'src/app/shared/services/loading-helper.service';
import { LocationService } from 'src/app/shared/services/location.service';
import { PageStateService } from 'src/app/shared/services/page-state.service';
import { TransformedPlace } from 'src/app/shared/statics/google-map.interface';

@Component({
  selector: 'app-create-edit-address',
  templateUrl: './create-edit-address.page.html',
  styleUrls: ['./create-edit-address.page.scss'],
  standalone: false,
})
export class CreateEditAddressPage implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapElement!: ElementRef;
  map!: google.maps.Map;
  userMarker!: google.maps.Marker;
  userCircle!: google.maps.Circle;

  isDragging: boolean = false;
  isConfirmLocation: boolean = false;
  actionType: string = '';

  // searching
  searchControl = new FormControl('');
  locations: { placeId: string; address: string }[] = [];
  selectedLocation: TransformedPlace = null!;

  //edit
  addressId: string = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private locationService: LocationService,
    private ngZone: NgZone,
    private router: Router,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private pageStateService: PageStateService,
    private loadingHelper: LoadingHelperService,
  ) {}

  ngOnInit() {
    this.checkActionTypeFromUrl();
    this.listenSearchValueChanges();
  }

  ngAfterViewInit() {
    this.initMap()
      .then(() => {
        if (this.actionType === 'edit') {
          this.addressId = this.route.snapshot.paramMap.get('id') as string;
          //Use addressId to retrieve address information stored in db and get placeId to update UI
          this.onSelectedPlace('ChIJZ38s_OWtyjERPid2ODJxQ4k');
          return;
        }
        this.loadingHelper.hide();
      })
      .catch((err) => {
        console.error('Map initial failed', err);
        if (this.actionType !== 'edit') this.loadingHelper.hide();
      });
  }

  ngOnDestroy() {
    // clear all subsribe, prevent memory leak
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private checkActionTypeFromUrl() {
    const currentRoute = this.router.url;
    if (currentRoute.includes('create-address')) {
      this.actionType = 'create';
    } else if (currentRoute.includes('edit-address')) {
      this.actionType = 'edit';
    }
  }

  async updateUserLocation() {
    try {
      this.loadingHelper.show();
      const position = await this.locationService.getCurrentLocation();
      const userLatLng = new google.maps.LatLng(position.lat, position.lng);
      //Marker
      //this.setUserMarkerAndPosition(userLatLng);

      this.mapSetCenter(userLatLng.lat(), userLatLng.lng());
      this.map.setZoom(17);
    } catch (error) {
      console.error('Retrieve user location failed', error);
    } finally {
      this.loadingHelper.hide();
    }
  }

  onSelectedPlace(placeId: string) {
    this.loadingHelper.show();
    this.locationService
      .getPlaceDetail(placeId)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          if (!res) {
            console.error('retrieve selected place details failed');
            this.loadingHelper.hide();
            return;
          }

          this.locations = [];
          this.searchControl.setValue('');
          this.selectedLocation = res;

          this.applyLocation();
          this.mapSetCenter(res.location.latitude, res.location.longitude);
          this.loadingHelper.hide();
        },
        error: (err) => {
          console.error('retrieve selected place details failed', err);
          this.loadingHelper.hide();
        },
      });
  }

  blurLocation() {
    if (this.actionType === 'edit') {
      this.navCtrl.back();
      return;
    }

    this.ngZone.run(() => {
      this.isConfirmLocation = false;
      this.selectedLocation = null!;
      this.map.setZoom(15);
    });
  }

  applyLocation() {
    this.ngZone.run(() => {
      if (this.isConfirmLocation) {
        this.onSavingLocation();
      } else {
        this.onApplyLocation();
      }
    });
  }

  private listenSearchValueChanges() {
    const sub = this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((value) => {
          if (!value) {
            this.locations = [];
            return of([]);
          }
          return this.locationService.getAddressSuggestions(value);
        }),
      )
      .subscribe({
        next: (results) => {
          this.locations = results;
        },
        error: (err) => {
          console.error('Address Suggestion error:', err);
        },
      });
    this.subscriptions.push(sub);
  }

  private async initMap() {
    const defaultCenter = await this.locationService.getCurrentLocation();
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: defaultCenter,
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
      disableDefaultUI: true,
      mapTypeId: 'roadmap',
      clickableIcons: false,
      styles: [
        { featureType: 'administrative', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
        { featureType: 'road', stylers: [{ visibility: 'on' }] },
      ],
    });

    this.userMarker = new google.maps.Marker({
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        scaledSize: new google.maps.Size(40, 40),
      },
      title: 'Your Location',
    });
    this.userCircle = new google.maps.Circle({
      radius: 25,
      fillColor: '#4285F4',
      fillOpacity: 0.3,
      strokeColor: '#4285F4',
      strokeOpacity: 0.6,
      strokeWeight: 2,
    });

    this.map.addListener('dragstart', () => {
      this.ngZone.run(() => {
        this.isDragging = true;
      });
    });

    this.map.addListener('dragend', () => {
      this.ngZone.run(() => {
        this.isDragging = false;
      });
    });
  }

  private onSavingLocation() {
    this.loadingHelper.show();
    setTimeout(() => {
      this.loadingHelper.hide();
      this.navCtrl.back();
    }, 1000);
  }

  private onApplyLocation() {
    const latLng = this.map.getCenter();
    if (!latLng) return;

    if (this.selectedLocation) {
      this.isConfirmLocation = true;
      this.map.setZoom(17);
      return;
    }

    this.loadingHelper.show();
    this.locationService
      .searchNearbyPlaces(latLng.lat(), latLng.lng(), 50)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.loadingHelper.hide();
          if (res && res.length > 0) {
            this.selectedLocation = res[0];
            this.selectedLocation.location.latitude = latLng.lat();
            this.selectedLocation.location.longitude = latLng.lng();

            this.isConfirmLocation = true;
            this.map.setZoom(17);
          } else {
            this.map.setZoom(15);
            this.isConfirmLocation = false;
            alert('No matching location found, please try another location');
          }
        },
        error: (err) => {
          console.error('Error in searching for nearby places', err);
          this.loadingHelper.hide();
          this.isConfirmLocation = false;
        },
      });
  }

  private setUserMarkerAndPosition(latLng: google.maps.LatLng) {
    this.userMarker.setMap(this.map);
    this.userCircle.setMap(this.map);

    this.userMarker.setPosition(latLng);
    this.userCircle.setCenter(latLng);
  }

  private removeUserMarkerAndPosition() {
    this.userMarker.setMap(null);
    this.userCircle.setMap(null);
  }

  private mapSetCenter(lat: number, lng: number) {
    const userLatLng = new google.maps.LatLng(lat, lng);
    this.map.setCenter(userLatLng);
  }

  private watchMapCenter() {
    const latlng = this.map.getCenter();
    console.log('Lat', latlng?.lat());
    console.log('Lng', latlng?.lng());
  }
}
