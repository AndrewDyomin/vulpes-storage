import { useEffect, useRef, useState } from 'react';
import { Connection } from '../Connection/Connection';
import { green, red } from '@mui/material/colors';
import Paper from '@mui/material/Paper';
import SaveAsOutlinedIcon from '@mui/icons-material/SaveAsOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AddLinkIcon from '@mui/icons-material/AddLink';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import css from './Node.module.css';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import toast from 'react-hot-toast';

export const Node = ({
  node,
  containerRef,
  nodeRefs,
  setNodes,
  refsReady,
  connectNodes,
  setConnectNodes,
}) => {
  const nodeRef = useRef(null);
  const { t } = useTranslation();
  const [title, setTitle] = useState(node?.title);
  const [description, setDescription] = useState(node?.description);
  const [setStatus, setSetStatus] = useState(node?.setStatus);

  const saveNode = async() => {
    const res = await axios.post("/knowledge/update-node", { ...node, title, description, setStatus });
    toast.success(res.data.message)
    setNodes([]);
  }

  const addNodeBetween = async(parentId, childId) => {
    const { data } = await axios.post("/knowledge/add-between", {parentId, childId});
    toast.success(data.message)
    setNodes([]);
  }

  const addChild = async() => {
    const { data } = await axios.post("/knowledge/add-child", node);
    toast.success(data.message)
    setNodes([]);
  }

  const deleteNode = async() => {
    const { data } = await axios.post("/knowledge/delete-node", node);
    toast.success(data.message)
    setNodes([]);
  }

  useEffect(() => {
    nodeRefs.current.set(node._id, nodeRef);

    return () => {
      nodeRefs.current.delete(node._id);
    };
  }, [node._id, nodeRefs]);

  return (
    <div>
      
      <Paper
        ref={nodeRef}
        className={`${css.node} ${connectNodes && css.connect}`}
        onClick={()=> {if(connectNodes) {setConnectNodes(prev => ({ ...prev, parentIds: node.parentIds, childId: node._id}))}}}
        elevation={5}
        key={node?._id}
      >
        {node?.isEdit ? 
        // ---- РЕДАКТОР ----
        <div>
            <div className={css.nodeInputWrapper}>
                <span className={css.nodeLabel}>
                    {t('title')}
                </span>
                <input 
                    value={title}
                    className={css.nodeInput}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>
            <div className={css.nodeInputWrapper}>
                <span className={css.nodeLabel}>
                    {t('description')}
                </span>
                <textarea 
                    value={description}
                    className={css.nodeInput}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                />
            </div>
            <div className={css.nodeInputWrapper}>
                <span className={css.nodeLabel}>
                    {t('set status')}
                </span>
                <input 
                    value={setStatus}
                    className={css.nodeInput}
                    onChange={(e) => setSetStatus(e.target.value)}
                />
            </div>
            <div className={css.nodeInputWrapper}>
                <SaveAsOutlinedIcon  
                    color='#3da012'
                    className={css.nodeSave}
                    onClick={saveNode}
                />
            </div>
        </div>
        :
        // --- ОБЫЧНЫЙ ВИД ---
        <div className={css.nodeWrapper}>
            <div className={css.nodeActions}>
                <button 
                    className={css.nodeButton}
                    onClick={() => setNodes(prev => prev.map(n => n._id === node._id ? { ...n, isEdit: true } : n))}
                >
                    <EditIcon fontSize='small' sx={{ color: green[500] }}/>
                </button>
                {node.parentIds.length > 0 &&
                  <button 
                    className={css.nodeButton}
                    onClick={deleteNode}
                  >
                    <DeleteForeverOutlinedIcon fontSize='small' sx={{ color: red[500] }}/>
                  </button>
                }
            </div>
            
            <div className={css.nodeAddChild}>
                <AddCircleOutlineIcon 
                    onClick={addChild}
                />

                <AddLinkIcon 
                  onClick={() => setConnectNodes({parentId: node._id})}
                />
            </div>
            {/* TITLE */}
            <p 
              key={node._id + node.title} 
              className={css.nodeTitle}
            >
              {node.title}
            </p>

            {/* DESCRIPTION */}
            {node?.description !== '' && 
            <p 
              key={node._id + node.description}
              className={css.nodeDescription}
            >
              {node.description}
            </p>}

            {/* SET STATUS */}
            {node?.setStatus !== '' && 
            <p 
              key={node._id + node.setStatus}
              className={css.nodeSetStatus}
            >
              {'Статус => '}{node.setStatus}
            </p>}
        </div>
        }
      </Paper>

      {refsReady && node.parentIds?.map(parentId => {
        const parentRef = nodeRefs.current.get(parentId);

        if (!parentRef) return null;

        return (
          <Connection
            key={`${parentId}-${node._id}`}
            fromRef={parentRef}
            toRef={nodeRef}
            containerRef={containerRef}
            onAdd={() => addNodeBetween(parentId, node._id)}
          />
        );
      })}

      {node.children?.length > 0 && (
        <div className={css.children}>
          {node.children.map(child => (
            <Node
              key={child._id}
              node={child}
              containerRef={containerRef}
              setNodes={setNodes}
              nodeRefs={nodeRefs}
              refsReady={refsReady}
              connectNodes={connectNodes}
              setConnectNodes={setConnectNodes}
            />
          ))}
        </div>
      )}

    </div>
  );
};