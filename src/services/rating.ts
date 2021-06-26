import { BeachPosition, Beach } from '@src/models/beach';

const waveHeights = {
  ankleToKnee: {
    min: 0.3,
    max: 1.0,
  },
  waistHigh: {
    min: 1.0,
    max: 2.0,
  },
  headHigh: {
    min: 2.0,
    max: 2.5,
  },
};
export class Rating {
  constructor(private beach: Beach) {}

  public getRatingBasedOnWindAndWavePositions(
    wavePosition: BeachPosition,
    windPosition: BeachPosition
  ): number {
    if (wavePosition === windPosition) return 1;

    if (this.isWindOffShore(wavePosition, windPosition)) return 5;

    return 3;
  }

  public getRatingForSwellPeriod(period: number): number {
    if (period >= 7 && period < 10) {
      return 2;
    }

    if (period >= 10 && period < 14) {
      return 4;
    }

    if (period >= 14) {
      return 5;
    }

    return 1;
  }

  public getRatingForSwellSize(height: number): number {
    if (
      height >= waveHeights.ankleToKnee.min &&
      height < waveHeights.ankleToKnee.max
    ) {
      return 2;
    }

    if (
      height >= waveHeights.waistHigh.min &&
      height < waveHeights.waistHigh.max
    ) {
      return 3;
    }

    if (height >= waveHeights.headHigh.min) {
      return 5;
    }

    return 1;
  }

  public getPositionFromLocation(coordinates: number): BeachPosition {
    if (coordinates >= 310 || (coordinates < 50 && coordinates >= 0)) {
      return BeachPosition.north;
    }

    if (coordinates >= 50 && coordinates < 120) {
      return BeachPosition.east;
    }

    if (coordinates >= 120 && coordinates < 220) {
      return BeachPosition.south;
    }

    if (coordinates >= 220 && coordinates < 310) {
      return BeachPosition.west;
    }

    return BeachPosition.east;
  }

  private isWindOffShore(
    waveDirection: string,
    windDirection: string
  ): boolean {
    return (
      (waveDirection === BeachPosition.north &&
        windDirection === BeachPosition.south &&
        this.beach.position === BeachPosition.north) ||
      (waveDirection === BeachPosition.south &&
        windDirection === BeachPosition.north &&
        this.beach.position === BeachPosition.south) ||
      (waveDirection === BeachPosition.east &&
        windDirection === BeachPosition.west &&
        this.beach.position === BeachPosition.east) ||
      (waveDirection === BeachPosition.west &&
        windDirection === BeachPosition.east &&
        this.beach.position === BeachPosition.west)
    );
  }
}
