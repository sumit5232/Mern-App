import React, { useState, useCallback } from 'react'
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
 } from 'reactflow';
 import 'reactflow/dist/style.css';
 import axios from 'axios';

 const initialNodes = [
  {
    id: '1',
    position: { x: 100, y: 100},
    data: { label: 'Input Prompt' },
    type: 'input',
    style: { Background: '#fff', border: '1px solid #777', padding: '10px' }
  },
  {
    id: '2',
    position: { x: 400, y: 100 },
    data: { label: 'AI Output will appear here...' },
    type: 'output',
    style: { background: '#e0f7fa', color: '#000',border: '1px solid #006064', padding: '10px', width: '200px' }
  },
 ];

 const initialEdges = [{ id: 'e1-2', source: '1', target: '2', animated: true }];

 export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [prompt, setPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const runFlow = async () => {
    if(!prompt) return alert("Please enter a prompt!");
    setLoading(true);
    try{
      const res = await axios.post('https://mern-app-backend-o0ft.onrender.com/api/ask-ai', { prompt });

      const answer = res.data.answer;

      setAiResponse(answer);

      setNodes((nds) => 
        nds.map((node) => {
          if(node.id === '2') {
            return { ...node, data: { label: answer } };
          }
          return node;
        })
      );
    } catch (error) {
      console.error("Error calling API", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const saveToDB = async () => {
    if(!prompt || !aiResponse){
      return alert("Nothing to save!");
    }

    try {
      await axios.post('https://mern-app-backend-o0ft.onrender.com/api/save',{
        prompt:prompt,
        response:aiResponse
      });
      alert("Saved to MongoDB successfully!");
    } catch(error) {
      console.log("Save error", error);
    }
  };
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px', background: '#f0f0f0', display: 'flex', gap: '10px', alignItems:'center' }}>
        <input 
          type="text"
          placeholder='Type your prompt here...'
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{ padding: '10px', width: '300px' }}
        />
        <button onClick={runFlow} disabled={loading} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          {loading ? "Running..." : "Run Flow"}
        </button>
        <button onClick={saveToDB} style={{ padding: '10px 20px', background: 'green', color: 'white', cursor: 'pointer' }}>
          Save TO DB
        </button>
      </div>

      <div style={{ flex:1}}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>

      </div>
    </div>
  );
}

