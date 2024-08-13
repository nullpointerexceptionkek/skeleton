'use client';

import { FC, createContext, useContext, useId } from 'react';
import * as radio from '@zag-js/radio-group';
import { useMachine, normalizeProps } from '@zag-js/react';
import type { SegmentContextState, SegmentProps, SegmentItemsProps } from './types.js';
import { noop } from '../../internal/noop.js';

// Contexts ---

export const SegmentContext = createContext<SegmentContextState>({
	api: {} as ReturnType<typeof radio.connect>,
	indicatorText: ''
});

// Components ---

const SegmentRoot: FC<SegmentProps> = ({
	orientation = 'horizontal',
	// Root
	base = 'inline-flex items-stretch overflow-hidden',
	background = 'preset-outlined-surface-200-800',
	border = 'p-2',
	gap = 'gap-2',
	padding = '',
	rounded = 'rounded-container',
	width = '',
	classes = '',
	// States
	orientVertical = 'flex-col',
	orientHorizontal = 'flex-row',
	stateDisabled = 'disabled',
	stateReadOnly = 'pointer-events-none',
	// Indicator
	indicatorBase = 'top-[var(--top)] left-[var(--left)] w-[var(--width)] h-[var(--height)]',
	indicatorBg = 'preset-filled',
	indicatorText = 'text-surface-contrast-950 dark:text-surface-contrast-50',
	indicatorRounded = 'rounded',
	indicatorClasses = '',
	// Events
	onValueChange = noop,
	// Children
	children,
	// Zag
	...zagProps
}) => {
	// Zag
	const [state, send] = useMachine(
		radio.machine({
			id: useId(),
			onValueChange: (details) => onValueChange(details.value),
			orientation
		}),
		{ context: zagProps }
	);
	const api = radio.connect(state, send, normalizeProps);

	// Set Context
	const ctx = { api, indicatorText };

	// Reactive
	const rxOrientation = state.context.orientation === 'vertical' ? orientVertical : orientHorizontal;
	const rxDisabled = state.context.disabled ? stateDisabled : '';
	const rxReadOnly = state.context.readOnly ? stateReadOnly : '';

	return (
		<div
			{...api.getRootProps()}
			className={`${base} ${rxOrientation} ${background} ${border} ${padding} ${gap} ${rounded} ${width} ${rxDisabled} ${rxReadOnly} ${classes}`}
			data-testid="segment"
		>
			{/* Indicator */}
			<div
				{...api.getIndicatorProps()}
				className={`${indicatorBase} ${indicatorBg} ${indicatorRounded} ${indicatorClasses}`}
				data-testid="segment-indicator"
			></div>
			{/* Items */}
			<SegmentContext.Provider value={ctx}>{children}</SegmentContext.Provider>
		</div>
	);
};

const SegmentItem: FC<SegmentItemsProps> = ({
	// Root
	base = 'btn cursor-pointer z-[1]',
	classes = '',
	// Label
	labelBase = 'pointer-events-none transition-colors duration-100',
	labelClasses = '',
	// State
	stateDisabled = 'disabled',
	// Children
	children,
	// Zag
	...zagProps
}) => {
	// Get Context
	const ctx = useContext(SegmentContext);
	const state = ctx.api.getItemState(zagProps);

	// Reactive
	const rxDisabled = state.disabled ? stateDisabled : '';
	const rxActiveText = state.checked ? ctx.indicatorText : '';

	return (
		<label {...ctx.api.getItemProps(zagProps)} className={`${base} ${rxDisabled} ${classes}`} data-testid="segment-item">
			{/* Label */}
			<span
				{...ctx.api.getItemTextProps(zagProps)}
				className={`${labelBase} ${rxActiveText} ${labelClasses}`}
				data-testid="segment-item-label"
			>
				{children}
			</span>
			{/* Hidden Input */}
			<input {...ctx.api.getItemHiddenInputProps(zagProps)} data-testid="segment-item-input" />
		</label>
	);
};

export const Segment = Object.assign(SegmentRoot, {
	Item: SegmentItem
});
