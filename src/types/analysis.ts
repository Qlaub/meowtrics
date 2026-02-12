/**
 * Analysis Types
 * Output format for pre-deploy analysis script
 */

// Can pairing represented as a tuple [can1, can2]
export type CanCoupling = [string, string]

export interface AnalysisOutput {
  'least-represented-couplings': CanCoupling[]
  generatedAt?: string
}
