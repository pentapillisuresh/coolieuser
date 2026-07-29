export const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return '';
    }
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  export const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
  
    if (isNaN(date.getTime())) {
      return '';
    }
  
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  export const formatCurrency = (amount: number) => {
    return '₹' + amount.toFixed(2);
  };