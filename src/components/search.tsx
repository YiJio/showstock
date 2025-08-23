// packages
import { useEffect, useRef, useState } from 'react';

interface SearchProps {
	symbols: any[];
	onClick: (symbol: string) => void;
}

export const Search = ({ symbols, onClick }: SearchProps) => {
	// states
	const [query, setQuery] = useState<string>('');
	const [results, setResults] = useState<any[]>([]);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	// refs
	const dropdownRef = useRef<HTMLDivElement>(null);

	const getHighlightedText = (text: string, highlight: string) => {
		const regex = new RegExp(`(${highlight})`, 'gi');
		return text.split(regex).map((part, index) => part.toLowerCase() === highlight.toLowerCase() ? (<span key={index} className='bg-amber-200'>{part}</span>) : (part));
	}

	const handleClick = (symbol: string) => {
		onClick && onClick(symbol);
		setQuery('');
		setResults([]);
		setIsDropdownOpen(false);
	}

	useEffect(() => {
		if (query.length > 0) {
			// need to split by symbol first so that it returns that one at top
			let results = symbols.filter((s) => {
				const symbolMatch = s.symbol?.toLowerCase().includes(query.toLowerCase());
				return symbolMatch;
			}).slice(0, 5);
			if (results.length === 0) {
				results = symbols.filter((s) => {
					const descMatch = s.name?.toLowerCase().includes(query.toLowerCase());
					return descMatch;
				}).slice(0, 5);
			}
			setResults(results);
			setIsDropdownOpen(true);
		} else {
			setResults([]);
		}
	}, [query, symbols]);

	useEffect(() => {
		const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				setIsDropdownOpen(false);
			}
		}
		document.addEventListener('mousedown', handleOutsideClick);
		return () => { document.removeEventListener('mousedown', handleOutsideClick); }
	}, []);

	return (
		<div className='relative'>
			<input type='text' className='border-2 border-gray-100 hover:border-gray-400 focus:border-gray-500 p-2 w-full rounded-md transition-all hover:transition-all' value={query} onChange={(e) => setQuery(e.target.value)} placeholder='Search stock...' />
			{isDropdownOpen && results.length > 0 && (<div ref={dropdownRef} className='absolute w-full py-2 border-2 border-gray-300 bg-white shadow-2xl mt-1 rounded h-auto z-1000'>
				<div className='w-full max-h-45 overflow-y-auto'>
					{results.map((s) => (<div key={s.symbol} className='py-1 px-2.5 hover:bg-gray-100 cursor-pointer line-clamp-1' onClick={() => handleClick(s.symbol)}>
						<b>{getHighlightedText(s.symbol, query)}</b> / <small className='text-gray-500'>{getHighlightedText(s.name, query)}</small>
					</div>))}
				</div>
			</div>)}
		</div>
	);
}