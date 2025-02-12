import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";

interface EmailCardProps {
	question: string;
	currentIndex: number;
	totalQuestions: number;
	onBack?: () => void;
	onNext?: (value: string) => void;
	currentValue?: string;
	showBackButton?: boolean;
	backText?: string;
	nextText?: string;
	placeholder?: string;
}

export const EmailCard: React.FC<EmailCardProps> = ({
	question,
	currentIndex,
	totalQuestions,
	onBack,
	onNext,
	currentValue = "",
	showBackButton = true,
	backText = "Back",
	nextText = "Next",
	placeholder,
}) => {
	const [email, setEmail] = useState(currentValue);
	const [error, setError] = useState<string>("");

	const validateEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!email) {
			setError("Email is required");
			return false;
		}
		if (!emailRegex.test(email)) {
			setError("Please enter a valid email address");
			return false;
		}
		setError("");
		return true;
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setEmail(value);
		if (value === "") {
			setError("");
		} else {
			validateEmail(value);
		}
	};

	const handleSubmit = () => {
		if (email && validateEmail(email) && onNext) {
			onNext(email);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && email && validateEmail(email)) {
			handleSubmit();
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			className='max-w-2xl mx-auto w-full px-4 sm:px-0'
		>
			<div className='space-y-6 sm:space-y-8'>
				<div className='space-y-4 sm:space-y-6'>
					<h2 className='text-2xl sm:text-4xl font-bold text-gray-900'>
						{question}
					</h2>
					<div className='relative'>
						<input
							type='email'
							placeholder={placeholder}
							value={email}
							onChange={handleChange}
							onKeyPress={handleKeyPress}
							className={`w-full bg-transparent border-b-2 ${
								error ? "border-red-500" : "border-gray-200"
							} px-3 py-3 sm:px-4 sm:py-4 text-lg sm:text-2xl text-gray-900 placeholder-gray-400 focus:border-[#b4854b] focus:outline-none transition-colors duration-200`}
						/>
						{error && (
							<div className='absolute mt-2 flex items-center gap-2 text-red-500 text-sm'>
								<AlertCircle className='w-4 h-4' />
								{error}
							</div>
						)}
					</div>
				</div>
				<div className='flex items-center justify-between text-gray-500 text-sm sm:text-base'>
					<div className='flex items-center gap-2 sm:gap-4'>
						{showBackButton && currentIndex > 0 && (
							<button
								onClick={onBack}
								className='flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900'
							>
								<ChevronLeft className='w-4 h-4' />
								{backText}
							</button>
						)}
					</div>
					<div className='flex items-center gap-2 sm:gap-4'>
						<span>
							{currentIndex + 1}/{totalQuestions}
						</span>
						{onNext && (
							<button
								onClick={handleSubmit}
								className={`flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors ${
									email && !error
										? "text-[#b4854b] hover:bg-[#b4854b]/10"
										: "opacity-50 cursor-not-allowed text-gray-400"
								}`}
								disabled={!email || !!error}
							>
								{nextText}
								<ChevronRight className='w-4 h-4' />
							</button>
						)}
					</div>
				</div>
			</div>
		</motion.div>
	);
};
