import { Directionality } from '@angular/cdk/bidi';
import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { DirectionService } from '../features';
import { DEFAULT_DIRECTION_CONFIG, DirectionConfig } from '../features/direction/direction.config';
import { DirectionalityBridge } from '../features/direction/direction.directionality';
import { DIRECTION_CONFIG } from '../features/direction/direction.token';

export const provideDirection = (config?: Partial<DirectionConfig>): EnvironmentProviders => {
  return makeEnvironmentProviders([
    { provide: DIRECTION_CONFIG, useValue: { ...DEFAULT_DIRECTION_CONFIG, ...config } },
    DirectionService,
    DirectionalityBridge,
    // Override CDK's default `Directionality` so every overlay tracks the service.
    { provide: Directionality, useExisting: DirectionalityBridge },
    provideEnvironmentInitializer(() => inject(DirectionService)),
  ]);
};
