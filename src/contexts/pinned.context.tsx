// packages
import React, { createContext, useContext, useEffect, useState } from 'react';
// types
import { StockQuote } from '../types';
// utils
import { isCacheValid } from '../utils';
// constants
import { DEFAULT_TICKERS } from '../constants';

const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;

interface PinnedContextType {
	loading: boolean;
	stockRows: StockQuote[];
	setStockRows: (rows: StockQuote[]) => void;
	fetchTickers: (isNew: boolean) => void;
	updatePinnedRows: (updated: StockQuote[]) => void;
}

const PinnedContext = createContext<PinnedContextType | null | undefined>(undefined);

export function usePinned(): PinnedContextType {
	const context = useContext(PinnedContext);
	if (context === undefined || context === null) {
		throw new Error('usePinned must be used within a PinnedProvider');
	}
	return context;
}

export const PinnedProvider = ({ children }: { children: React.ReactNode }) => {
	// states
	const [stockRows, setStockRows] = useState<StockQuote[]>([]);
	const [loading, setLoading] = useState(false);

	const fetchTickers = async (isNew: boolean) => {
		try {
			//console.log('fetching from finnhub', stockRows);
			const tickers: StockQuote[] = DEFAULT_TICKERS.map((t) => ({ symbol: t.symbol, name: t.name, price: 0.00, priceChange: 0.00, percentChange: 0.00 }));
			const tempRows = isNew ? tickers : stockRows;
			const data = await Promise.all(
				tempRows.map(async (s, i) => {
					const q = await fetch(`https://finnhub.io/api/v1/quote?symbol=${s.symbol}&token=${FINNHUB_API_KEY}`).then((r) => r.json());
					//console.log(q);
					const stockQuote: StockQuote = { symbol: s.symbol, name: s.name, price: q.c, priceChange: q.d, percentChange: q.dp, pinned: s.pinned ?? false };
					//if (i === 0) { handleSelectStock(s); }
					return stockQuote;
				})
			);
			const storageData = {
				stocks: data,
				timestamp: Date.now(),
			};
			setStockRows(data);
			localStorage.setItem('pinned-stocks', JSON.stringify(storageData));
		} catch (error) {
			console.error(error);
		}
	}

	const updatePinnedRows = (updated: StockQuote[]) => {
		const storageData = {
			stocks: updated,
			timestamp: Date.now(),
		};
		setStockRows(updated);
		localStorage.setItem('pinned-stocks', JSON.stringify(storageData));
	}

	useEffect(() => {
		setLoading(true);
		const storage = localStorage.getItem('pinned-stocks');
		if (storage) {
			const localStocks = JSON.parse(storage);
			if (localStocks && isCacheValid(localStocks.timestamp)) {
				setStockRows(localStocks.stocks);
			} else {
				fetchTickers(false);
			}
		} else {
			fetchTickers(true);
		}
		setTimeout(() => {
			setLoading(false);			
		}, 750);
	}, []);

	return (
		<PinnedContext.Provider value={{ loading, stockRows, setStockRows, fetchTickers, updatePinnedRows }}>
			{children}
		</PinnedContext.Provider>
	);
};

export default PinnedContext;