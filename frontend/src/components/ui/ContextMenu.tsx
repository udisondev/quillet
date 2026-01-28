import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import type { ReactNode } from "react";

export interface ContextMenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
  divider?: boolean;
}

interface ContextMenuProps {
  open: boolean;
  position: { top: number; left: number };
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ open, position, items, onClose }: ContextMenuProps) {
  return (
    <Menu
      open={open}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={open ? { top: position.top, left: position.left } : undefined}
    >
      {items.map((item, index) => [
        item.divider && index > 0 ? <Divider key={`divider-${index}`} /> : null,
        <MenuItem
          key={item.label}
          onClick={() => {
            item.onClick();
            onClose();
          }}
          sx={item.danger ? { color: "error.main" } : undefined}
        >
          {item.icon && (
            <ListItemIcon sx={item.danger ? { color: "error.main" } : undefined}>
              {item.icon}
            </ListItemIcon>
          )}
          <ListItemText>{item.label}</ListItemText>
        </MenuItem>,
      ])}
    </Menu>
  );
}
