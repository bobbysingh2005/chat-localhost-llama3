# React Chat App with Dockerized Ollama

## Overview

This project demonstrates a robust and efficient AI-powered chat application, seamlessly integrating a React frontend with a Dockerized Ollama backend. The application features a user-friendly interface and a powerful REST API, all encapsulated within Docker containers to ensure a smooth deployment experience and consistent runtime environment.

### Key Features

- **Docker Integration**: Streamline deployment and management with Docker, creating isolated and reproducible environments.
- **AI-Powered Backend**: Utilize the latest Ollama Docker image for enhanced AI chat capabilities.
- **React Frontend**: Leverage React’s component-based architecture and virtual DOM for a dynamic and scalable user interface.

## Technologies Used

- **React**: A popular JavaScript library for building user interfaces, known for its performance and flexibility.
- **Docker**: An open-source platform for automating containerized applications, simplifying deployment, scaling, and management.
- **Ollama**: A pre-built Docker image optimized for AI-driven chat applications.

## Benefits

By combining Docker and React, this project achieves:
- **Hassle-Free Deployment**: Easily deploy the application without worrying about dependency conflicts.
- **Isolated Environments**: Run different versions and configurations of the application independently.
- **Scalability and Performance**: Efficiently handle increased loads and ensure a responsive user experience.
- **User-Friendly Interface**: Provide an intuitive and engaging frontend for end-users.

## Getting Started

Follow these steps to set up the project on your local machine:

### Prerequisites

Ensure Docker is installed on your system. If not, refer to the [official Docker installation guide](https://docs.docker.com/get-docker/) for instructions specific to your operating system.

### Setup Instructions

1. **Clone the Repository**
Open a terminal or command prompt and navigate to your desired directory. Then, clone the repository:
```bash
mkdir my-chat-app
cd my-chat-app
git clone https://github.com/bobbysingh2005/chat-localhost-llama3.git my-chat
cd my-chat
```

1. Install Dependencies
(Optional: Only if you need to modify the React code)
Install the required npm packages for the React frontend:
```bash
npm install
```

1. Start the Application
* Development Mode:
Start the React development server and open the application in your browser:
```bash
npm run dev
```
The application will be available at: http://localhost:8080.
* Production Mode:
To run both the React frontend and the Ollama backend as Docker services, use:
```bash
npm start
```
The application will be accessible at: http://localhost:8080.
Verify the status of the Docker containers with:
```bash
docker ps --format '{{.Names}}\t{{.Status}}\t{{.Ports}}'
```

1. Initial Setup
On first run, you will be prompted to enter your name. This information is saved in localStorage, so you won't need to re-enter it in future sessions.
2. Initially, there will be no Llama model available in the chat app. To get the latest Llama models, run the following command:
```bash
docker exec -it chatApi ollama pull llama3.1
```
3. Using Other Llama Models
• If you want to use a different Llama model, use the same command to pull the desired model into the `chatApi` container. For example, replace `llama3.1` with the specific model name or version you wish to use

###### Usage Tips
* Interact with the chat application through the React frontend, which communicates with the Llama3 module via the Ollama REST API.
* Ensure the Docker container for Llama3 is running and properly configured before starting the React application.

##### Contributing
Contributions are welcome! To contribute to this project:
1. Fork the repository.
2. Create a new branch for your changes.
3. Make your modifications.
4. Submit a pull request with a description of your changes.

##### License
This project is licensed under the MIT License. See the LICENSE file for details.
This version includes improved descriptions and formatting, ensuring that it is easy to read and follow.