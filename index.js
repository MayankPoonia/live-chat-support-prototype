const io = require("socket.io")(3000, {
  cors: {
    origin: "http://localhost:5173", // Allow Vite dev server
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["my-custom-header"],
    transports: ["websocket", "polling"],
  },
});

// Store active tickets
const activeTickets = new Map();

// Store admin socket
let adminSocket = null;

io.on("connection", (socket) => {
  console.log("Connection Made on socket with id:", socket.id);

  // Handle admin connection
  socket.on("admin-connect", () => {
    adminSocket = socket;
    console.log("Admin connected");
    // Send all active tickets to admin
    adminSocket.emit("active-tickets", {
      tickets: Array.from(activeTickets.values()),
    });
  });

  // Handle ticket creation
  socket.on("create-ticket", (data) => {
    const ticketId = Date.now().toString();
    const ticket = {
      id: ticketId,
      messages: [{ text: data.message, sender: "user" }],
      socketId: socket.id,
      createdAt: new Date().toISOString(),
    };

    activeTickets.set(ticketId, ticket);

    // Notify user
    socket.emit("ticket-created", { ticketId });

    // Notify admin if connected
    if (adminSocket) {
      adminSocket.emit("new-ticket", { ticket });
    }
  });

  // Handle user messages
  socket.on("user-message", (data) => {
    const ticket = activeTickets.get(data.ticketId);
    if (ticket) {
      ticket.messages.push({ text: data.message, sender: "user" });

      // Notify admin if connected
      if (adminSocket) {
        adminSocket.emit("user-message", {
          ticketId: data.ticketId,
          message: data.message,
        });
      }
    }
  });

  // Handle admin responses
  socket.on("admin-response", (data) => {
    const ticket = activeTickets.get(data.ticketId);
    if (ticket) {
      ticket.messages.push({ text: data.message, sender: "admin" });

      // Notify the specific user
      io.to(ticket.socketId).emit("admin-response", {
        ticketId: data.ticketId,
        message: data.message,
      });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    if (socket === adminSocket) {
      adminSocket = null;
      console.log("Admin disconnected");
    } else {
      // Remove tickets associated with disconnected user
      for (const [ticketId, ticket] of activeTickets.entries()) {
        if (ticket.socketId === socket.id) {
          activeTickets.delete(ticketId);
          if (adminSocket) {
            adminSocket.emit("ticket-closed", { ticketId });
          }
        }
      }
    }
  });
});
