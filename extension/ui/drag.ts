/**
 * Drag functionality for the floating popup
 */

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  initialRight: number;
  initialTop: number;
}

let dragState: DragState = {
  isDragging: false,
  startX: 0,
  startY: 0,
  initialRight: 0,
  initialTop: 0,
};

export function initializeDrag(headerElement: HTMLElement) {
  const rootElement = document.getElementById("sl-extension-root");
  if (!rootElement) return;

  headerElement.style.cursor = "move";
  headerElement.style.userSelect = "none";

  const handleMouseDown = (e: MouseEvent) => {
    // Only drag if clicking on the header, not buttons
    if ((e.target as HTMLElement).tagName === "BUTTON") return;
    if ((e.target as HTMLElement).closest("button")) return;

    dragState.isDragging = true;
    dragState.startX = e.clientX;
    dragState.startY = e.clientY;

    // Get current position
    const currentRight = parseInt(rootElement.style.right) || 40;
    const currentTop = parseInt(rootElement.style.top) || 120;
    
    dragState.initialRight = currentRight;
    dragState.initialTop = currentTop;

    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragState.isDragging) return;

    const deltaX = e.clientX - dragState.startX;
    const deltaY = e.clientY - dragState.startY;

    // Calculate new position (right decreases as we move right)
    const newRight = dragState.initialRight - deltaX;
    const newTop = dragState.initialTop + deltaY;

    // Keep within viewport bounds
    const maxRight = window.innerWidth - 350;
    const maxTop = window.innerHeight - 100;

    const boundedRight = Math.max(10, Math.min(maxRight, newRight));
    const boundedTop = Math.max(10, Math.min(maxTop, newTop));

    rootElement.style.right = `${boundedRight}px`;
    rootElement.style.top = `${boundedTop}px`;

    e.preventDefault();
  };

  const handleMouseUp = () => {
    if (dragState.isDragging) {
      dragState.isDragging = false;

      // Save position
      const finalRight = parseInt(rootElement.style.right) || 40;
      const finalTop = parseInt(rootElement.style.top) || 120;
      
      try {
        localStorage.setItem(
          "sl-popup-position",
          JSON.stringify({ right: finalRight, top: finalTop })
        );
      } catch (error) {
        console.error("Failed to save position:", error);
      }
    }
  };

  headerElement.addEventListener("mousedown", handleMouseDown);
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);

  // Cleanup function
  return () => {
    headerElement.removeEventListener("mousedown", handleMouseDown);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };
}

