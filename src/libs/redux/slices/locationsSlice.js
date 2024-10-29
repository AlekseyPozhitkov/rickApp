// src/features/locations/locationsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchLocations = createAsyncThunk(
    'locations/fetchLocations',
    async ({ page, filters }) => {
        const { name, type, dimension } = filters || {};
        const response = await axios.get('https://rickandmortyapi.com/api/location', {
            params: { page, name, type, dimension },
        });
        return response.data;
    }
);

const locationsSlice = createSlice({
    name: 'locations',
    initialState: {
        items: [],
        status: 'idle',
        nextPage: 1,
        hasMore: true,
        filters: {
            name: '',
            type: '',
            dimension: '',
        },
        filterOptions: {
            type: [],
            dimension: [],
        },
    },
    reducers: {
        setLocationFilter: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
            state.items = [];
            state.nextPage = 1;
            state.hasMore = true;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLocations.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchLocations.fulfilled, (state, action) => {
                state.status = 'succeeded';

                // Только добавляем элементы, если у нас есть новые данные
                if (action.payload.results.length > 0) {
                    state.items = [...state.items, ...action.payload.results];
                }

                state.nextPage += 1;
                state.hasMore = !!action.payload.info.next;

                // Обновляем опции фильтра только для уникальных значений
                action.payload.results.forEach((location) => {
                    if (location.type && !state.filterOptions.type.includes(location.type)) {
                        state.filterOptions.type.push(location.type);
                    }
                    if (location.dimension && !state.filterOptions.dimension.includes(location.dimension)) {
                        state.filterOptions.dimension.push(location.dimension);
                    }
                });
                Object.keys(state.filterOptions).forEach((filterType) => {
                    state.filterOptions[filterType] = state.filterOptions[filterType].sort((a, b) => {
                        if (a === "unknown") return 1;
                        if (b === "unknown") return -1;
                        return a.localeCompare(b);
                    });
                });
            })
            .addCase(fetchLocations.rejected, (state) => {
                state.status = 'failed';
                state.hasMore = false;
            });
    }
});

export const { setLocationFilter } = locationsSlice.actions;
export default locationsSlice.reducer;