# 🟦 Personal Assistant Backend Features & API Documentation

## Overview
This document lists all backend tools, features, and API endpoints available for the Fastify + Ollama personal assistant. It includes status, usage, and integration notes for developers.

---

## ✅ Implemented Features (Working)

### 1. Weather
- **APIs:** Open-Meteo, OpenWeatherMap, WeatherAPI
- **Endpoint:** `/api/weather`
- **Usage:** Get current weather for any location. Fallback to Open-Meteo if no API key.

### 2. News
- **APIs:** NewsAPI, Currents API
- **Endpoint:** `/api/news`
- **Usage:** Get top headlines or search news topics. Fallback to RSS if no API key.

### 3. Time & Date
- **APIs:** WorldTimeAPI, ipapi.co
- **Endpoint:** `/api/time`, `/api/timezone`
- **Usage:** Get current time by timezone or IP.

### 4. Location & Geocoding
- **APIs:** Nominatim (OpenStreetMap)
- **Endpoint:** `/api/geocode-forward`, `/api/geocode-reverse`
- **Usage:** Forward/reverse geocoding for addresses and coordinates.

### 5. Utilities
- **APIs:** ipapi.co, Nager.Date, Joke API, Quotable
- **Endpoints:** `/api/ip-lookup`, `/api/public-holidays`, `/api/random-joke`, `/api/quote-of-day`
- **Usage:** IP info, holidays, jokes, quotes.

### 6. Web Search & Scraping
- **APIs:** DuckDuckGo HTML, Cheerio
- **Endpoints:** `/api/search`, `/api/scrape`, `/api/search-and-scrape`
- **Usage:** Search web, scrape pages, combine search & scrape.

### 7. AI Model Integration
- **Model:** Ollama (llama3.2:1b)
- **Helper:** `askOllama(promptText)`
- **Usage:** Send any text to AI model and get response. Used in search/scrape routes and can be reused anywhere.

---

## 🚧 In Development / Planned
- Registry refactor for unified tool access and fallback logic
- Config/.env updates for new API keys and endpoints
- Automated backend tests for all endpoints
- Advanced error handling and rate limiting
- Frontend enhancements and real-time AI streaming

---

## API Usage Examples

### Weather
```http
GET /api/weather?location=London
```

### News
```http
GET /api/news?category=technology&country=us
```

### Time & Date
```http
GET /api/time?timezone=Asia/Kolkata
GET /api/timezone?ip=8.8.8.8
```

### Geocoding
```http
GET /api/geocode-forward?query=Ahmedabad
GET /api/geocode-reverse?lat=23.03&lon=72.58
```

### Utilities
```http
GET /api/ip-lookup
GET /api/public-holidays?countryCode=IN&year=2025
GET /api/random-joke
GET /api/quote-of-day
```

### Web Search & Scraping
```http
GET /api/search?q=chatbots
GET /api/scrape?url=https://example.com
GET /api/search-and-scrape?q=AI news
```

### AI Model
```js
const response = await askOllama('Summarize this:\n' + text);
```

---

## Developer Notes
- All endpoints are async, return JSON, and handle errors gracefully.
- No paid APIs required; all features use free/public endpoints.
- AI model helper is reusable for any backend feature.
- See code comments for integration details and extension points.

---

## Status Legend
- **✅ Working:** Fully implemented and tested
- **🚧 In Development:** Partially complete or planned

---

For questions or feature requests, contact the project maintainer.
