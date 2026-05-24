import MomPageClient from './MomPageClient';

type Props = { params: { id: string } };

/** Server passes route param so the client always has a real meeting id (avoids empty useParams() on nested client routes). */
export default function MomPage({ params }: Props) {
  return <MomPageClient meetingId={params.id} />;
}
