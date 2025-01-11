import tldData from './tld.json'

export interface TLD {
    domain: string
    type: string
    tldManager: string
}

export const tlds: TLD[] = tldData

