import { Box } from '@mui/material';

export const RadialMenu = ({ actions = [] }) => {
  const count = actions.length;
  const angle = 360 / count;

  return (
    <Box
      sx={{
        position: 'relative',
        width: 150,
        height: 150,
        borderRadius: '50%',
        display: 'flex',
        margin: '0 auto',
      }}
    >
      {/* Центральная кнопка */}
      <Box
        sx={{
          position: 'absolute',
          width: '50%',
          height: '50%',
          borderRadius: '50%',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#1e1e1e',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3,
          cursor: 'pointer',
          transition: '0.2s ease',
          '&:hover': {
            background: '#333',
          },
        }}
      >
        MAIN
      </Box>

      {/* Сегменты */}
      {actions.map((action, i) => (
        <Box
          key={i}
          onClick={action.onClick}
          sx={{
            position: 'absolute',
            inset: 0,
            border: '2px solid #000',
            borderRadius: '50%',
            cursor: 'pointer',

            clipPath: `polygon(50% 50%, 100% 0%, 100% 100%)`,

            transform: `rotate(${angle * i}deg) skewY(${90 - angle}deg)`,
            transformOrigin: '50% 50%',
            background: action.color || '#ccc',
            transition: '0.2s ease',

            '&:hover': {
              filter: 'brightness(1.2)',
            },
          }}
        >
          {/* Внутренний слой для текста */}
          <Box
            sx={{
              position: 'absolute',
              color: '#fff',
              top: '50%',
              left: '35%',
              transform: `translate(0, -50%) rotate(${angle}deg)`,
              transformOrigin: 'center',
              fontSize: 12,
              fontWeight: 600,
              width: '100%',
              textAlign: 'center',
            }}
          >
            {action.title}
          </Box>
        </Box>
      ))}
    </Box>
  );
};


// {/* <RadialMenu
//     actions={[
//     { title: '2', color: '#4d4d4d', onClick: () => console.log('2') },
//     { title: '3', color: '#4d4d4d', onClick: () => console.log('3') },
//     { title: '4', color: '#4d4d4d', onClick: () => console.log('4') },
//     { title: '1', color: '#4d4d4d', onClick: () => console.log('1') },
//     ]}
// />  */}
