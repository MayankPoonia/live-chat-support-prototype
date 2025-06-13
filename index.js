const io = require("socket.io")(3000, {
  cors: {
    origin: "http://localhost:5173", // Allow Vite dev server
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["my-custom-header"],
    transports: ["websocket", "polling"],
  },
});

console.log("\x1b[36m%s\x1b[0m", "🚀 Server is running on port 3000");
console.log("\x1b[33m%s\x1b[0m", "📡 Waiting for connections...");

// Store active tickets
const activeTickets = new Map();

// Store admin socket
let adminSocket = null;

io.on("connection", (socket) => {
  console.log(
    "\x1b[32m%s\x1b[0m",
    `✅ New connection established - Socket ID: ${socket.id}`
  );

  // Handle admin connection
  socket.on("admin-connect", () => {
    adminSocket = socket;
    console.log("\x1b[35m%s\x1b[0m", "👨‍💼 Admin connected");
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
    console.log("\x1b[34m%s\x1b[0m", `🎫 New ticket created - ID: ${ticketId}`);

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
      console.log(
        "\x1b[36m%s\x1b[0m",
        `💬 User message received - Ticket ID: ${data.ticketId}`
      );

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
      console.log(
        "\x1b[33m%s\x1b[0m",
        `👨‍💼 Admin response sent - Ticket ID: ${data.ticketId}`
      );

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
      console.log("\x1b[31m%s\x1b[0m", "👋 Admin disconnected");
    } else {
      // Remove tickets associated with disconnected user
      for (const [ticketId, ticket] of activeTickets.entries()) {
        if (ticket.socketId === socket.id) {
          activeTickets.delete(ticketId);
          console.log(
            "\x1b[31m%s\x1b[0m",
            `❌ Ticket closed - ID: ${ticketId}`
          );
          if (adminSocket) {
            adminSocket.emit("ticket-closed", { ticketId });
          }
        }
      }
    }
  });
});
