import { ExpandMore } from "@mui/icons-material";
import { Button, Card, CardContent, CardHeader, Collapse } from "@mui/material";
import React from "react";

interface ExpandableCardProps {
  headerTitle: string;
  children: JSX.Element;
}

const ExpandableCard = ({ headerTitle, children }: ExpandableCardProps) => {
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const ExpandableHeader = ({
    expanded,
    handleExpandClick,
  }: {
    expanded: boolean;
    handleExpandClick: () => void;
  }): JSX.Element => {
    return (
      <Button onClick={handleExpandClick}>
        <h2>{headerTitle}</h2>
        <ExpandMore sx={{ rotate: expanded ? "180deg" : "0deg" }} />
      </Button>
    );
  };

  return (
    <Card
      sx={{
        maxWidth: "1000px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CardHeader
        action={
          <ExpandableHeader
            expanded={expanded}
            handleExpandClick={handleExpandClick}
          />
        }
      />
      <Collapse in={expanded}>
        <CardContent>{expanded ? children : null}</CardContent>
      </Collapse>
    </Card>
  );
};

export default ExpandableCard;
