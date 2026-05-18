import { Row, StatPill } from '@/components/ui';

export function ProfileStats({
  posts,
  friends,
  communities
}: {
  posts: number;
  friends: number;
  communities: number;
}) {
  return (
    <Row>
      <StatPill label="Posts" value={posts} />
      <StatPill label="Friends" value={friends} />
      <StatPill label="Places" value={communities} />
    </Row>
  );
}
