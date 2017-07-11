import { InjectionToken } from '@angular/core';

/**
 * An OpaqueToken which is used to inject the SYNC_API_URL in to this or any other module.
 *
 * For example, in your injectable constructor:
 *
 *   Inject(SYNC_API_URL) apiUrl: string
 *
 */
export let SYNC_API_URL = new InjectionToken<string>('openfact.sync.api.url');
