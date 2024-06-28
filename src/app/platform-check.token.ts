import { InjectionToken } from '@angular/core';

export const PLATFORM_CHECK = new InjectionToken<() => boolean>('PLATFORM_CHECK');