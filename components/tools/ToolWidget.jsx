'use client';

import { BioTool, CommentTool, CounterTool, FontTool, LineBreakTool, NameTool } from './TextTools';
import { LogoTool, ResizerTool, SliceTool } from './ImageTools';
import { HandleTool, LinkedInTool, TagTool, TitleTool, UnfollowersTool } from './MoreTools';

const WIDGETS = { font: FontTool, counter: CounterTool, linebreak: LineBreakTool, name: NameTool, bio: BioTool, comment: CommentTool, resizer: ResizerTool, logo: LogoTool, slice: SliceTool, handle: HandleTool, linkedin: LinkedInTool, yttitle: TitleTool, yttags: TagTool, unfollowers: UnfollowersTool };

/** The interactive part of a free tool page. Everything runs in the browser. */
export default function ToolWidget({ kind, config, platform }) {
  const W = WIDGETS[kind];
  return W ? <W config={config} platform={platform} /> : null;
}
