/**
 * 
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { MetricsErrorEnumInterface } from './metrics-error-enum.interface';


export interface MetricsErrorInterface { 
    /**
     * Metrics error (METRICS-000), Tenant ID not set (METRICS-003), User ID not set (METRICS-002), Forbidden (METRICS-001), User not found (METRICS-004)
     */
    message: string;
    code: MetricsErrorEnumInterface;
    metadata?: object;
}
export namespace MetricsErrorInterface {
}


