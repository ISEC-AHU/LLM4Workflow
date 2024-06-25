# LLM4Workflow

LLM4Workflow is an innovative retrieval-augmented workflow generation tool driven by LLM.

## ✨ Features

🤖  **Automatic Model Generation**: automatically generate executable workflow models from natural language-based workflow descriptions.

🔍 **Automatic Knowledge Embedding**: support users in importing a collection of process-related APIs with one click. LLM4Workflow automatically embeds these APIs into the LLM’s contextual environment.

🔄  **Automatic Process Formation**: utilize LLM chains to decompose complex tasks into multiple sub-tasks, and efficiently complete the parsing and formation process.

📊 **Automatic Process Evaluation**: enable users to deploy workflow models to real-world workflow systems such as EdgeWorkflow with one click so that users can easily monitor and evaluate the workflow performance.

## 🎥 Demonstration

For more details, you can watch the [demo video]() on YouTube.

## 🛠️ Getting Started

To run LLM4Workflow, follow these steps:

1. Clone this repository:

   ```sh
   git clone https://github.com/ISEC-AHU/LLM4Workflow.git LLM4Workflow
   ```

2. Navigate to the backend directory: `cd LLM4Workflow/backend`

3. Set up the Python  environment: `virtualenv venv && venv/bin/activate && poetry install`

4. Start the Postgres server: `docker-compose up`

5. Configure environment variables:

   ```sh
   # Obtain OpenAI API access from https://openai.com/blog/openai-api
   OPENAI_API_KEY=<your-api-key>
   
   # Lang Smith Configuration[Optional]
   LANGCHAIN_TRACING_V2=true
   LANGCHAIN_API_KEY=<your-api-key>
   LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
   ```

6. Start the backend server: `langchain serve`

7. Set up the frontend environment: `cd frontend && npm install`

8. Start the frontend (dev) server: `npm run start`

9. Your application should now be up and running in your browser! If you need to change the startup port, you can configure it in the `vite.config.ts` file.
