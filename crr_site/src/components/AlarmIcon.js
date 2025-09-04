import React from 'react';
import { Tooltip } from '@mui/material';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';

export default function AlarmIcon({ active, message }) {
  if (!active) return null;
  return (
    <Tooltip title={message || 'Inactivitate'}>
      <NotificationImportantIcon color="error" sx={{ ml: 1, verticalAlign: 'middle' }} />
    </Tooltip>
  );
} 