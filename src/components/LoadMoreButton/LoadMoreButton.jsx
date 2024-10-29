import Button from "@mui/material/Button";
import "@fontsource/roboto/500.css";

export const LoadMoreButton = ({ onClick }) => {
  return (
    <Button
      sx={{
        width: 155,
        height: 35,
        backgroundColor: "#F2F9FE",
        color: "#2196F3",
        font: "Roboto",
        fontWeight: 500,
        fontSize: 14,
      }}
      variant="contained"
      onClick={onClick} // Передаем onClick в кнопку
    >
      Load more
    </Button>
  );
};
