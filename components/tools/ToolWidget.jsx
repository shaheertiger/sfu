'use client';

import { BioTool, CommentTool, CounterTool, FontTool, LineBreakTool, NameTool } from './TextTools';
import { LogoTool, ResizerTool, SliceTool } from './ImageTools';
import { CaptionTool, HandleTool, LinkedInTool, ShadowbanTool, TagTool, TitleTool, UnfollowersTool } from './MoreTools';
import { ToolLocale } from './locale';

const WIDGETS = { font: FontTool, counter: CounterTool, linebreak: LineBreakTool, name: NameTool, bio: BioTool, comment: CommentTool, resizer: ResizerTool, logo: LogoTool, slice: SliceTool, handle: HandleTool, linkedin: LinkedInTool, yttitle: TitleTool, yttags: TagTool, unfollowers: UnfollowersTool, caption: CaptionTool, shadowban: ShadowbanTool };

/**
 * The interactive part of a free tool page. Everything runs in the browser. `locale` switches the
 * labels on localized pages (lib/i18n.js); `config` can carry a translated starting sample.
 */
export default function ToolWidget({ kind, config, platform, locale = 'en' }) {
  const W = WIDGETS[kind];
  if (!W) return null;
  return (
    <ToolLocale.Provider value={locale}>
      <W config={config} platform={platform} />
    </ToolLocale.Provider>
  );
}
