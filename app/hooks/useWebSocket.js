export function useWebSocket(email) {
    const [messages, setMessages] = useState([]);
  
    useEffect(() => {
      if (!email) return;
  
      const socket = new WebSocket(`ws://great-papayas-march.loca.lt/ws/alerts/${email}`);
  
      socket.onmessage = (event) => {
        setMessages((prev) => [...prev, event.data]);
      };
  
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
  
      return () => {
        socket.close();
      };
    }, [email]);
  
    return messages;
  }
  