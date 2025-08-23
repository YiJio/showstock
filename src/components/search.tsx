interface SearchProps {
	search: string;
	setSearch: (search: string) => void;
	results: any;
	onClick: (stock: any) => void;
}

export const Search = ({ search, setSearch, results, onClick }: SearchProps) => {

	const getHighlightedText = (text: string, highlight: string) => {
		const regex = new RegExp(`(${highlight})`, 'gi');
		return text.split(regex).map((part, index) => part.toLowerCase() === highlight.toLowerCase() ? (<span key={index} className='bg-amber-200'>{part}</span>) : (part));
	}

	return (
		<div className='relative'>
			<input type='text' className='border-2 border-gray-100 hover:border-gray-400 focus:border-gray-500 p-2 w-full rounded-md transition-all hover:transition-all' value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Search symbol or company name...' />
			{results.length > 0 && (<div className='absolute w-full py-2 border-2 border-gray-300 bg-white shadow-2xl mt-1 rounded max-h-40 overflow-y-auto'>
				{results.map((s) => (<div key={s.symbol} className='py-1 px-2.5 hover:bg-gray-100 cursor-pointer' onClick={() => onClick(s)}>
					{getHighlightedText(s.symbol, search)} / {getHighlightedText(s.name, search)}
				</div>))}
			</div>)}
		</div>
	);
}