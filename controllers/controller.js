export const hello = async (req, res) => {
  try {
    res.send("hello");
  } catch (error) {
    console.error('Error fetching token list:', error);
  }
};




