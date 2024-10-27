import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const baseUrl = "https://rickandmortyapi.com/api/episode";

export const fetchEpisodes = createAsyncThunk(
    'episodes/fetchEpisodes',
    async ({ page, filters }) => {
        const { name } = filters;

        const response = await axios.get(baseUrl, {
            params: { page, name },
        });
        return response.data;
    }
);

const episodesSlice = createSlice({
    name: 'episodes',
    initialState: {
        items: [],
        status: 'idle',
        nextPage: 1,
        hasMore: true, // Добавляем hasMore для отслеживания наличия данных
        filters: {
            name: '',
        },
    },
    reducers: {
        setFilter: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
            state.items = [];
            state.nextPage = 1;
            state.hasMore = true;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchEpisodes.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchEpisodes.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = [...state.items, ...action.payload.results];
                state.nextPage += 1;
                state.hasMore = !!action.payload.info.next; // Обновляем hasMore в зависимости от наличия следующей страницы
            })
            .addCase(fetchEpisodes.rejected, (state) => {
                state.status = 'failed';
                state.hasMore = false;
            });
    },
});

export const { setFilter } = episodesSlice.actions;
export default episodesSlice.reducer;
