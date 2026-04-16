export class DistanceCalculator {
  private static readonly EARTH_RADIUS_KM = 6371;
  private static readonly EARTH_RADIUS_METERS = 6371000;

  /**
   * 计算距离（返回米）
   */
  static getDistanceInMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
    return this.calculateHaversineDistance(lat1, lng1, lat2, lng2, this.EARTH_RADIUS_METERS);
  }

  /**
   * 计算距离（返回公里）
   */
  static getDistanceInKilometers(lat1: number, lng1: number, lat2: number, lng2: number): number {
    return this.calculateHaversineDistance(lat1, lng1, lat2, lng2, this.EARTH_RADIUS_KM);
  }

  /**
   * 判断两点是否在指定距离内
   */
  static isWithinDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
    maxDistanceKm: number,
  ): boolean {
    const distance = this.getDistanceInKilometers(lat1, lng1, lat2, lng2);
    return distance <= maxDistanceKm;
  }

  private static calculateHaversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
    radius: number,
  ): number {
    const lat1Rad = this.toRadians(lat1);
    const lat2Rad = this.toRadians(lat2);
    const latDiff = this.toRadians(lat2 - lat1);
    const lngDiff = this.toRadians(lng2 - lng1);

    const a =
      Math.sin(latDiff / 2) ** 2 +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(lngDiff / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return radius * c;
  }

  private static toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
