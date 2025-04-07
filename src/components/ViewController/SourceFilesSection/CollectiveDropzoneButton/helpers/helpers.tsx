import { List, ListItem } from '@mui/material';

export const getMissingFilesContent = (missingFilesErrors: string[]) => (
  <List sx={sx.list}>
    {missingFilesErrors.map((item) => (
      <ListItem
        key={item}
        sx={sx.listItem}
      >
        {item}
      </ListItem>
    ))}
  </List>
);

const sx = {
  list: {
    listStyle: 'inside',
    padding: '0px 0px 0px 24px',
    margin: '0px'
  },
  listItem: {
    display: 'list-item',
    paddingTop: '0px',
    paddingBottom: '4px'
  }
};
