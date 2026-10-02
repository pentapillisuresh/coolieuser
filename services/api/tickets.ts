import client from './client';

export const ticketService = {
  /**
   * Create a new support ticket
   * @param {object} data - { subject, message, category?, priority? }
   */
  async createTicket(data: {
    category: string;
    subject: string;
    message: string; // YYYY-MM-DD
    priority: string; // HH:MM
    bookingId:number;
  }) {
    try {
      const res = await client.post('/tickets', data);
      return res.data;
    } catch (error) {
      console.error('Create ticket error:', error);
    }
  },

  /**
   * Get current user's tickets
   */
  async getMyTickets(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    try {
      const res = await client.get('/tickets/my', { params });
      return res.data;
    } catch (error) {
        console.log("error::",error)
    }
  },

  /**
   * Get a specific ticket with replies
   */
  async getTicketById(id:number) {
    try {
      const res = await client.get(`/tickets/${id}`);
      return res.data;
    } catch (error) {
        console.log("error::",error)
    }
  },

  /**
   * Reply to a ticket
   */
  async replyToTicket(id:number, message:string, isInternal = false) {
    try {
      const res = await client.post(`/tickets/${id}/reply`, {
        message,
        isInternal,
      });
      return res.data;
    } catch (error) {
        console.log("error::",error)
    }
  },
};