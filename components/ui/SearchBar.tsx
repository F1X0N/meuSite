'use client'

import { useState } from 'react'

const normalizeText = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

const matchesSearchTerm = (item, searchTerm) => {
  const normalizedTerm = normalizeText(searchTerm)
  const normalizedTitle = normalizeText(item.title)
  const normalizedDescription = normalizeText(item.description)
  const normalizedTags = item.tags.map(normalizeText).join(' ')

  return (
    normalizedTitle.includes(normalizedTerm) ||
    normalizedDescription.includes(normalizedTerm) ||
    normalizedTags.includes(normalizedTerm)
  )
}

const filterItemsBySearch = (items, searchTerm) => {
  if (!searchTerm.trim()) {
    return items
  }

  return items.filter((item) => matchesSearchTerm(item, searchTerm))
}

const buildInputClasses = () =>
  'w-full rounded-lg border bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none'

export const SearchBar = ({ items, onFilteredResults }) => {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearchChange = (event) => {
    const term = event.target.value
    setSearchTerm(term)

    const filtered = filterItemsBySearch(items, term)
    onFilteredResults(filtered)
  }

  const handleClear = () => {
    setSearchTerm('')
    onFilteredResults(items)
  }

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Buscar por título, descrição ou tags..."
        value={searchTerm}
        onChange={handleSearchChange}
        className={buildInputClasses()}
      />
      {searchTerm && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Limpar busca"
        >
          ✕
        </button>
      )}
    </div>
  )
}
