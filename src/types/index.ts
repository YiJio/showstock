
export interface StockPoint {
  t: number; // date
	d?: string; // date string
  c: number; // close
	o: number; // open
	h: number; // high
	l: number; // low
}

export interface StockData {
  price: number;
  priceChange: number;
  percentChange: number;
  history?: StockPoint[];
}

export interface StockSymbol {
	symbol: string;
	name: string;
}

export interface StockQuote extends StockSymbol, StockData {
	pinned?: boolean;
}