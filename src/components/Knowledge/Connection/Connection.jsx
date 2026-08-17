import { useEffect, useState } from 'react';
import css from './Connection.module.css';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const getPoint = (element, container, position) => {
  const elementRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  return {
    x:
      elementRect.left -
      containerRect.left +
      elementRect.width / 2,

    y:
      position === 'bottom'
        ? elementRect.bottom - containerRect.top
        : elementRect.top - containerRect.top,
  };
};

const createPath = (from, to) => {
  const distance = Math.max(Math.abs(to.y - from.y) * 0.5, 30);

  return `
    M ${from.x} ${from.y}
    C
      ${from.x} ${from.y + distance},
      ${to.x} ${to.y - distance},
      ${to.x} ${to.y}
  `;
};

export const Connection = ({
    fromRef,
    toRef,
    containerRef,
    onAdd
  }) => {

  const [path, setPath] = useState('');
  const [center, setCenter] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const update = () => {
      if (
        !fromRef.current ||
        !toRef.current ||
        !containerRef.current
      ) {
        return;
      }

      const from = getPoint(
        fromRef.current,
        containerRef.current,
        'bottom'
      );

      const to = getPoint(
        toRef.current,
        containerRef.current,
        'top'
      );

      setPath(createPath(from, to));

      setCenter({
        x: (from.x + to.x) / 2,
        y: (from.y + to.y) / 2,
      });
    };

    update();

    const resizeObserver = new ResizeObserver(update);

    resizeObserver.observe(fromRef.current);
    resizeObserver.observe(toRef.current);
    resizeObserver.observe(containerRef.current);

    window.addEventListener('resize', update);
    window.addEventListener('scroll', update);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update);
    };
  }, [fromRef, toRef, containerRef]);

  if (!path) {
    return null;
  }

  return (
    <div className={css.connection}>
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          overflow: 'visible',
          zIndex: 0,
        }}
        className={css.svg}
      >
        <path
          d={path}
          fill="none"
          stroke="#87d877"
          strokeWidth="2"
          className={css.line}
        />
      </svg>

      <button
        className={css.addButton}
        style={{
          left: center.x,
          top: center.y,
        }}
        onClick={onAdd}
      >
        <AddCircleOutlineIcon fontSize='large'/>
      </button>
    </div>
  );
};