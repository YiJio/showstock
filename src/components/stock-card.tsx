// packages
import { useEffect, useState } from 'react';
import { startOfDay, subDays } from 'date-fns';
import Skeleton from 'react-loading-skeleton';
// types
import { StockQuote } from '../types';
// utils
import { getFromIndex, getStockData } from '../utils';
// hooks
import { usePinned } from '../contexts/pinned.context';
// components
import { StockChart } from './stock-chart';
// constants
import { DEFAULT_TICKERS } from '../constants';

interface StockCardProps {
	ticker: string | null;
	symbols: any[];
}

export const StockCard = ({ ticker, symbols }: StockCardProps) => {
	// hooks
	const { stockRows, updatePinnedRows } = usePinned();
	// states
	const [isLoading, setIsLoading] = useState(false);
	const [stockQuote, setStockQuote] = useState<StockQuote | null>(null);

	const handlePin = () => {
		if (!stockQuote) return;
		const temp = [...stockRows];
		const stockIndex = stockRows.findIndex((a) => a.symbol == stockQuote?.symbol);
		const fromDefault = DEFAULT_TICKERS.findIndex((a) => a.symbol == stockQuote?.symbol);
		//console.log('currently', ticker, temp[stockIndex])
		if (temp[stockIndex]) {
			// if on table already, check for pinned state
			const pinned = temp[stockIndex].pinned;
			if (pinned) {
				//console.log('was pinned')
				// if unpinning stock from default list, simply remove pinned boolean
				// otherwise, remove it off of pinned rows
				//console.log('is from default', fromDefault)
				if (fromDefault !== -1) { temp[stockIndex].pinned = false; }
				else { temp.splice(stockIndex, 1); }
			} else {
				//console.log('was not pinned')
				// if pinning stock from default list, simply add pinned boolean
				if (fromDefault !== -1) { temp[stockIndex].pinned = true; }
			}
		} else {
			// if never on table, simply add as new to table
			temp.push({ symbol: stockQuote.symbol, name: stockQuote.name, price: stockQuote.price, priceChange: stockQuote.priceChange, percentChange: stockQuote.percentChange, pinned: true });
		}
		updatePinnedRows(temp);
	}

	useEffect(() => {
		if (!ticker || !symbols) return;
		const fetchData = async () => {
			setIsLoading(true);
			//console.log('calling fetch ticker data on polygon');
			const today = startOfDay(new Date());
			const thirtyDaysAgo = subDays(today, 30);
			const data = await getStockData(ticker, thirtyDaysAgo, today);
			const stock = getFromIndex(symbols, 'symbol', ticker);
			if (data) {
				const isPinned = getFromIndex(stockRows, 'symbol', stock.symbol);
				setStockQuote({ symbol: stock.symbol, name: stock.name, price: data.price, priceChange: data.priceChange, percentChange: data.percentChange, history: data.history, pinned: isPinned ? isPinned.pinned : false });
			}
			setTimeout(() => {
				setIsLoading(false);
			}, 750);
		}
		if (ticker) fetchData();
	}, [ticker, symbols]);

	if (isLoading) {
		return (
			<div className='lg:w-3/5 md:w-1/2 rounded-md border-2 border-gray-300 hover:shadow-lg'>
				<div className='p-4 w-full'>
					<div className='flex gap-2'>
						<Skeleton width='42px' height='42px' />
						<div className='flex flex-col gap-1'>
							<Skeleton width='80px' height='20px' />
							<Skeleton width='240px' height='14px' />
						</div>
					</div>
					<div className='my-2 flex flex-col gap-1'>
						<Skeleton width='120px' height='24px' />
						<Skeleton width='160px' height='16px' />
					</div>
					<Skeleton height='148px' />
				</div>
			</div>
		);
	}

	return (
		<div className='w-full md:w-1/2 rounded-md border-2 border-gray-300 hover:shadow-lg'>
			<div className='p-4 w-full'>
				<div className='w-full flex justify-between'>
					<div className='flex items-center gap-2'>
						<img className='w-10 h-10 rounded-md' src={`https://assets.parqet.com/logos/symbol/${stockQuote?.symbol}?format=png`} />
						<div className='flex flex-col'>
							<span className='text-xl font-bold'>{stockQuote?.symbol}</span>
							<span className='text-gray-500 text-sm'>{stockQuote?.name}</span>
						</div>
					</div>
					<button title='Pin to Table' className='flex items-center justify-center gap-1 py-1 px-2 h-full rounded-lg bg-gray-100 cursor-pointer transition-all hover:bg-gray-200 hover:transition-all' onClick={handlePin}>📌<small>{stockQuote?.pinned ? 'Already pinned' : 'Pin to Table'}</small></button>
				</div>
				<div className='w-full my-2 flex flex-col'>
					<big className='font-semibold text-2xl'>${stockQuote?.price}</big>
					<p>
						{stockQuote?.percentChange && (<span className={`${stockQuote.percentChange > 0 ? 'text-green-600' : 'text-red-600'}`}>${stockQuote.priceChange.toFixed(2)} ({stockQuote.percentChange.toFixed(2)}%)</span>)} Today
					</p>
				</div>
				{stockQuote?.history && (<StockChart data={stockQuote.history} />)}
			</div>
		</div>
	);
}