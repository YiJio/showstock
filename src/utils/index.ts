// packages
import { eachDayOfInterval, format, getUnixTime } from 'date-fns';
import { UTCDate } from '@date-fns/utc';
// types
import { StockData, StockPoint } from '../types';
// constants
import { CACHE_EXPIRY, SAMPLE_HISTORY } from '../constants';

const POLYGON_API_KEY = import.meta.env.VITE_POLYGON_API_KEY;

export function isCacheValid(timestamp: number) {
	return Date.now() - timestamp < CACHE_EXPIRY;
}

export function getFromIndex(array: any[], fieldCheck: string, value: any, returnField?: string | null) {
	const index = array.findIndex((a) => a[fieldCheck] == value);
	if (returnField) return array[index][returnField];
	return array[index];
}

export async function getStockData(
	ticker: string,
	from: string | Date,
	to: string | Date
): Promise<StockData | null> {
	try {
		//console.log('from', from, 'to', to)
		const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${format(from, 'yyyy-MM-dd')}/${format(to, 'yyyy-MM-dd')}?adjusted=true&sort=asc&limit=30&apiKey=${POLYGON_API_KEY}`;
		const res = await fetch(url);
		if (!res.ok) throw new Error(`Polygon API error: ${res.statusText}`);
		const data = await res.json();
		//console.log(data)
		if (!data.results || data.results.length < 2) {
			console.warn('Not enough data returned.');
			return null;
		}
		const results = data.results;
		//const results = SAMPLE_HISTORY;
		// latest and previous day closes
		const latest = results[results.length - 1];
		const previous = results[results.length - 2];
		const price = latest.c;
		const priceChange = price - previous.c;
		const percentChange = (priceChange / previous.c) * 100;
		// map history for charts
		const history: StockPoint[] = results.map((r: any) => {
			const points = {
				t: r.t,
				d: format(new UTCDate(r.t), 'yyyy-MM-dd'),
				c: r.c,
				o: r.o,
				h: r.h,
				l: r.l
			};
			return points;
		});
		//console.log('previous history', history)
		// fill in missing days without trades with last close
		const allDays = eachDayOfInterval({ start: from, end: to });
		let lastClose = history[0].c;
		const newHistory: StockPoint[] = [];
		for (const day of allDays) {
			const time = getUnixTime(new Date(day)) * 1000;
			const date = format(time, 'yyyy-MM-dd');
			const exists = getFromIndex(history, 'd', date);
			if (exists) {
				lastClose = exists.c;
				newHistory.push(exists);
			} else {
				newHistory.push({
					t: time,
					d: format(time, 'yyyy-MM-dd'),
					o: lastClose,
					h: lastClose,
					l: lastClose,
					c: lastClose
				});
			}
		}
		//console.log('updated history', newHistory)
		return { price, priceChange, percentChange, history: newHistory };
	} catch (err) {
		console.error('Error fetching stock data:', err);
		return null;
	}
}