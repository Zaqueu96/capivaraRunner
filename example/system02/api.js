
module.exports = {
     listUsers: async () => {
      const response = await fetch("http://localhost:3030/v1/users")
      return response.json();
    }
}