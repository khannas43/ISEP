import { redirect } from 'next/navigation';

/** Redirect legacy /meetings/new to canonical create URL so [id] does not treat "new" as a meeting id. */
export default function NewMeetingRedirect() {
  redirect('/meetings/create');
}
