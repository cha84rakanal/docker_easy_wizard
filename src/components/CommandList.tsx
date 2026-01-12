import { Box, Button, Container, Grid, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import type { CommandEntry } from "../models/command";
import CommandCard from "./CommandCard";

type CommandListProps = {
  entries: CommandEntry[];
  onCreateClick: () => void;
  onEditClick: (entry: CommandEntry) => void;
  onDeleteClick: (entry: CommandEntry) => void;
  onDuplicateClick: (entry: CommandEntry) => void;
};

export default function CommandList({
  entries,
  onCreateClick,
  onEditClick,
  onDeleteClick,
  onDuplicateClick,
}: CommandListProps) {
  return (
    <Box className="hero">
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              実行コマンド一覧
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Wizardで作成した docker run コマンドをまとめて管理します。
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {entries.length === 0 ? (
              <Grid item xs={12}>
                <Card className="card-rise" sx={{ borderStyle: "dashed" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      まだ登録がありません
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      右上の「新規作成」からWizardを開始してください。
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={onCreateClick}
                    >
                      Wizardを開く
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ) : (
              entries.map((entry) => (
                <Grid item xs={12} md={6} key={entry.id}>
                  <CommandCard
                    entry={entry}
                    onEditClick={onEditClick}
                    onDeleteClick={onDeleteClick}
                    onDuplicateClick={onDuplicateClick}
                  />
                </Grid>
              ))
            )}
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}
