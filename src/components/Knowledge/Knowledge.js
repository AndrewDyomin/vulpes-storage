import { useEffect, useRef, useState } from 'react';
import { Node } from './Node/Node';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { ClipLoader } from 'react-spinners';
import css from './Knowledge.module.css';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export const Knowledge = () => {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const nodeRefs = useRef(new Map());
  const [nodes, setNodes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refsReady, setRefsReady] = useState(false);
  const [connectNodes, setConnectNodes] = useState(null);

  const buildTree = nodes => {
    const map = new Map();

    for (const node of nodes) {
      map.set(node._id, {
        ...node,
        children: [],
        isEdit: node.isEdit ?? (
          node.title === '' && node.description === ''
        ),
      });
    }

    const roots = [];

    for (const node of map.values()) {
      const parentIds = node.parentIds || [];

      if (parentIds.length === 0) {
        roots.push(node);
        continue;
      }

      // Первый родитель определяет положение узла в дереве
      const parent = map.get(parentIds[0]);

      if (parent) {
        parent.children.push(node);
      }
    }

    return roots;
  };

  const tree = buildTree(nodes);

  const createFirstNode = () => {
    setNodes([
      {
        parentId: null,
        title: '',
        description: '',
        setStatus: '',
        isEdit: true,
      },
    ]);
  };

  useEffect(() => {
    async function getNodes() {
        setIsLoading(true);
        const { data } = await axios.get("/knowledge/all-nodes");
        setNodes(data);
        setRefsReady(false);
        setIsLoading(false);
    }

    if (!nodes?.length) {
        getNodes();
    }
  }, [nodes])

  useEffect(() => {
    if (!nodes.length) return;

    const timer = requestAnimationFrame(() => {
      setRefsReady(true);
    });

    return () => cancelAnimationFrame(timer);
  }, [nodes]);

  useEffect(() => {
  const addLink = async() => {
    const { data } = await axios.post('/knowledge/add-link', connectNodes);
    toast.success(data.message);

    setConnectNodes(null);
    setNodes([]);
  }

    if (connectNodes?.childId) {
      addLink();
    }
  }, [connectNodes])

  return (
    <div ref={containerRef} className={css.container}>
      {isLoading ?
        <ClipLoader color="#c04545" size="30px" className={css.loader}/>
        :
        nodes?.length ? (
        tree.map(node => (
          <Node 
            key={node.name + node?._id} 
            node={node} 
            containerRef={containerRef} 
            setNodes={setNodes}
            nodeRefs={nodeRefs}
            refsReady={refsReady}
            connectNodes={connectNodes}
            setConnectNodes={setConnectNodes}
          />
        ))
      ) : (
        <button className={css.addButton} onClick={createFirstNode}>
          <AddCircleOutlineIcon fontSize="large" />
        </button>
      )}
      {connectNodes &&
      <div className={css.connectNodesAlarm}>
        <p>{t('click the next node')}</p>
        <button
          onClick={() => setConnectNodes(null)}
        >{t('cancel')}</button>
      </div>
      }
    </div>
  );
};
