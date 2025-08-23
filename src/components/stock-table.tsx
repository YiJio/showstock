// packages
import { useEffect, useState } from 'react';
// types
import { StockQuote } from '../types';
// hooks
import { usePinned } from '../contexts/pinned.context';

interface StockTableProps {
	onClick: (symbol: string) => void;
}

export const StockTable = ({ onClick }: StockTableProps) => {
	// hooks
	const { stockRows } = usePinned();
	// variables
	const [updatedRows, setUpdatedRows] = useState<StockQuote[]>(stockRows);

	const handleClick = (symbol: string) => {
		onClick && onClick(symbol);
	}

	useEffect(() => {
		if (stockRows) setUpdatedRows(stockRows);
	}, [stockRows]);

	return (
		<div className='w-full md:w-1/2 rounded-md border-2 border-gray-300 hover:shadow-lg'>
			<div className='p-4 w-full'>
				<table className='table-auto border-collapse border-transparent w-full text-sm'>
					<thead>
						<tr>
							<th></th>
							<th className='px-2 py-1 text-xs text-gray-500'>Symbol</th>
							<th className='px-2 py-1 text-xs text-gray-500'>Price ($)</th>
							<th className='w-[10%] px-2 py-1 text-xs text-gray-500'>Change ($)</th>
							<th className='w-[10%] px-2 py-1 text-xs text-gray-500'>Change (%)</th>
						</tr>
					</thead>
					<tbody>
						{updatedRows.sort((a, b) => {
							let boolR = -1;
							if (a.pinned === true && b.pinned === false) boolR = -1;
							else if (a.pinned === false && b.pinned === true) boolR = 1;
							else boolR = 0;
							return boolR || (a.symbol.localeCompare(b.symbol));
						}).slice(0, 10).map((r, i) => (<tr key={r.symbol} className='odd:bg-gray-50 hover:bg-gray-200 cursor-pointer' onClick={() => handleClick(r.symbol)}>
							<td className='text-xs pl-1 text-gray-500 opacity-50 font-semibold'>{i + 1}</td>
							<td className='px-2 py-1 flex items-center gap-2'>
								<img className='w-8 h-8 rounded-md' src={`https://assets.parqet.com/logos/symbol/${r.symbol}?format=png`} />
								<div className='flex flex-col'>
									<b className='flex gap-1'>{r.symbol}<small>{r.pinned ? '📌' : ''}</small></b>
									<span className='text-xs text-gray-400 line-clamp-1'>{r.name}</span>
								</div>
							</td>
							<td className='px-2 py-1'>${Number(r.price).toFixed(2)}</td>
							<td className={`px-2 py-1 ${r.priceChange > 0 ? 'text-green-600' : 'text-red-600'}`}>${Number(r.priceChange).toFixed(2)}</td>
							<td className={`px-2 py-1 ${r.percentChange > 0 ? 'text-green-600' : 'text-red-600'}`}>{Number(r.percentChange).toFixed(2)}%</td>
						</tr>))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
