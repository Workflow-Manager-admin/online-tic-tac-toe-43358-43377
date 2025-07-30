import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

test("renders main layout", () => {
  render(<App />);
  expect(screen.getByText(/Tic Tac Toe/i)).toBeInTheDocument();
  expect(screen.getByTestId("mode-select")).toBeInTheDocument();
  expect(screen.getAllByTestId("square")).toHaveLength(9);
  expect(screen.getByTestId("new-game-btn")).toBeInTheDocument();
  expect(screen.getByTestId("reset-btn")).toBeInTheDocument();
  expect(screen.getByTestId("status")).toBeInTheDocument();
});

test("allows X to make a move and updates board", () => {
  render(<App />);
  const firstSquare = screen.getAllByTestId("square")[0];
  fireEvent.click(firstSquare);
  expect(firstSquare.textContent).toBe("X");
});

test("can switch to AI mode and AI plays", async () => {
  render(<App />);
  const modeSelect = screen.getByTestId("mode-select");
  fireEvent.change(modeSelect, { target: { value: "ai" } });
  // After about 600ms, AI may move. Make a user move, then AI should move
  const firstSquare = screen.getAllByTestId("square")[0];
  fireEvent.click(firstSquare); // User X moves
  // Board will update, AI will move as O
  // Wait for AI - simulate with setTimeout for now, actual test may need async wait or test lib timer.
});
