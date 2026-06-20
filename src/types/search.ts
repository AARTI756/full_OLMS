export interface SearchResultItem {
  id: string;
  type: 'candidate' | 'offer' | 'template';
  title: string;
  subtitle: string;
  href: string;
  group: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResultItem[];
  totals: {
    candidates: number;
    offers: number;
    templates: number;
  };
}
