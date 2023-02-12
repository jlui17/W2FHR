import { ExpandMore } from "@mui/icons-material";
import { Button, Card, CardContent, CardHeader, Collapse } from "@mui/material";
import React from "react";

interface ExpandableCardProps {
  headerTitle: string;
  children: JSX.Element;
  className: string;
}

const ExpandableCard = ({
  headerTitle,
  children,
  className,
}: ExpandableCardProps) => {
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
        <h1 className="text-lg font-bold normal-case text-black">
          {headerTitle}
        </h1>
        <ExpandMore
          className="text-black"
          sx={{ rotate: expanded ? "180deg" : "0deg" }}
        />
      </Button>
    );
  };

  return (
    <Card className={className}>
      <CardHeader
        action={
          <ExpandableHeader
            expanded={expanded}
            handleExpandClick={handleExpandClick}
          />
        }
      />
      <Collapse in={expanded}>
        <CardContent className="pt-0">{expanded ? children : null}</CardContent>
      </Collapse>
    </Card>
  );
};

export default ExpandableCard;
