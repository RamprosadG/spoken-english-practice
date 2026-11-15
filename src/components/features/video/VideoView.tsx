import { VideoActions } from "@/components/features/video/VideoActions";
import { VideoSection } from "@/components/features/video/VideoSection";
import type { VideoListData } from "@/types/video";
import { VideoHeader } from "./VideoHeader";

interface VideoViewProps {
  data: VideoListData;
  isLoading?: boolean;
}

export function VideoView({ data, isLoading = false }: VideoViewProps) {
  return (
    <>
      <VideoHeader
        actions={
          <VideoActions
            nextSequence={data.nextSequence}
            categories={data.categories}
            categoryRows={data.categoryRows}
          />
        }
      />
      <VideoSection
        videos={data.videos}
        pagination={data.pagination}
        filters={data.filters}
        categories={data.categories}
        isLoading={isLoading}
      />
    </>
  );
}
