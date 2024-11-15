import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchEpisodes = createAsyncThunk(
  "episodes/fetchEpisodes",
  async ({ page, filters }, { rejectWithValue }) => {
    try {
      const { name } = filters;
      const response = await axios.get("https://rickandmortyapi.com/api/episode", {
        params: { page, name }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch characters.");
    }
  }
);

// Асинхронный экшн для загрузки эпизодов персонажа
export const fetchCharacterEpisodes = createAsyncThunk(
  "episodes/fetchCharacterEpisodes",
  async (episodeUrls) => {
    const episodeIds = episodeUrls.map((url) => url.split("/").pop()).join(",");
    const response = await axios.get(`https://rickandmortyapi.com/api/episode/${episodeIds}`);
    return response.data;
  }
);

const episodesSlice = createSlice({
  name: "episodes",
  initialState: {
    items: [],
    status: "idle",
    nextPage: 1,
    hasMore: true,
    filters: {
      name: ""
    },
    errorMessage: "" // Добавляем поле для хранения сообщения об ошибке
  },
  reducers: {
    setEpisodeFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.items = [];
      state.nextPage = 1;
      state.hasMore = true;
      state.errorMessage = ""; // Очищаем сообщение об ошибке при изменении фильтра
    }
  },
  // Добавляем обработку fetchCharacterEpisodes в extraReducers
  extraReducers: (builder) => {
    builder
      .addCase(fetchEpisodes.pending, (state) => {
        state.status = "loading";
        state.errorMessage = ""; // Очищаем сообщение об ошибке при новой попытке загрузки
      })
      .addCase(fetchEpisodes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.errorMessage = "";

        // Используем Set для отслеживания уникальных id
        const existingIds = new Set(state.items.map((item) => item.id));
        // Добавляем только уникальные эпизоды
        const uniqueEpisodes = action.payload.results.filter((episode) => !existingIds.has(episode.id));

        state.items = [...state.items, ...uniqueEpisodes];
        state.nextPage += 1;
        state.hasMore = !!action.payload.info.next;
      })
      .addCase(fetchEpisodes.rejected, (state, action) => {
        state.status = "failed";
        state.hasMore = false;
        state.errorMessage = action.payload || "An error occurred."; // Сохраняем сообщение об ошибке
      })
      .addCase(fetchCharacterEpisodes.pending, (state) => {
        state.status = "loading";
        state.items = [];
        state.error = null;
      })
      .addCase(fetchCharacterEpisodes.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Преобразуем данные в массив, если это объект
        const episodes = Array.isArray(action.payload) ? action.payload : [action.payload];

        state.items = episodes; // Перезаписываем массив новыми эпизодами
      })
      .addCase(fetchCharacterEpisodes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  }
});

// Селектор
export const selectEpisodeById = (state, itemId) =>
  state.episodes.items.find((item) => item.id === itemId) || null;

export const { setEpisodeFilter } = episodesSlice.actions;
export default episodesSlice.reducer;
