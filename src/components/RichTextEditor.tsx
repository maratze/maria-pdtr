import { useMemo } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

interface RichTextEditorProps {
	value: string
	onChange: (value: string) => void
	placeholder?: string
	className?: string
}

export default function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
	// Настройка панели инструментов
	const modules = useMemo(() => ({
		toolbar: [
			[{ 'header': [1, 2, 3, false] }],
			['bold', 'italic', 'underline'],
			[{ 'list': 'ordered' }, { 'list': 'bullet' }],
			[{ 'indent': '-1' }, { 'indent': '+1' }],
			['link'],
			['clean']
		],
	}), [])

	// Разрешённые форматы
	const formats = [
		'header',
		'bold', 'italic', 'underline',
		'list', 'bullet',
		'indent',
		'link'
	]

	return (
		<div className={className}>
			<ReactQuill
				theme="snow"
				value={value}
				onChange={onChange}
				modules={modules}
				formats={formats}
				placeholder={placeholder}
				className="rich-text-editor"
			/>
		</div>
	)
}
