interface DialogProps {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
}

export const Dialog = ({ isOpen, setIsOpen }: DialogProps) => {
	return (
		<div className='absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/20'>
			<div className='md:max-w-[65%] lg:max-w-[40%] flex flex-col gap-3 m-4 py-8 px-12 border-2 border-gray-400 bg-white shadow-lg rounded-md'>
				<div className='text-center flex flex-col gap-2 text-sm leading-4.5'>
					<h2 className='mb-2 font-bold text-2xl'>Hey, sorry to interrupt!</h2>
					<p>Unfortunately, this site uses stock APIs with only limited calls (5 calls/minute).</p>
					<p>In the last minute, we have detected 5 calls already made (regardless if it was you or someone else on the site).</p>
					<p>We kindly ask you to wait patiently.</p>
				</div>
				<div className='flex justify-center gap-2'>
					<button className='py-1 px-4 bg-gray-300 hover:bg-gray-400 transition-all hover:transition-all rounded-md font-semibold cursor-pointer' onClick={() => setIsOpen(!isOpen)}>Got it</button>
				</div>
			</div>
		</div>
	);
}